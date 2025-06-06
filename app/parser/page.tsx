"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

interface ResumeParserResponse {
  jsonData?: Record<string, unknown>;
  error?: string;
  [key: string]: unknown; // Index signature
}

async function uploadResume(formData: FormData) {
  const response = await fetch("/api/parse-resume", {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export default function ResumeParserDashboard() {
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(
    null
  );
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newField, setNewField] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [resumeText, setResumeText] = useState("");
  const [customJsonEnabled, setCustomJsonEnabled] = useState(false);
  const [customJsonExample, setCustomJsonExample] = useState("");

  const { mutate, isPending } = useMutation<
    ResumeParserResponse,
    Error,
    FormData
  >({
    mutationFn: uploadResume,
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();

    if (inputMode === "file") {
      const fileInput = e.currentTarget.elements.namedItem(
        "resume"
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("resume", fileInput.files[0]);
      }
    } else {
      formData.append("resumeText", resumeText);
    }

    customFields.forEach((field) => formData.append("customFields", field));
    if (customJsonEnabled && customJsonExample.trim()) {
      formData.append("customJsonExample", customJsonExample);
    }

    setParsedData(null);
    const toastId = "resume-parse-toast";
    toast.loading("⏳ Processing resume...", { id: toastId });

    // console.log(" this is formdata \n");
    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    mutate(formData, {
      onSuccess: (data) => {
        toast.success("✅ Resume parsed successfully!", { id: toastId });
        setParsedData(data);
      },
      onError: (error) => {
        toast.error("❌ Failed to parse resume.", { id: toastId });
        console.error("Parsing error:", error);
      },
    });
  }

  function addCustomField() {
    if (newField.trim() && !customFields.includes(newField.trim())) {
      setCustomFields([...customFields, newField.trim()]);
      setNewField("");
    }
  }

  function removeCustomField(field: string) {
    setCustomFields(customFields.filter((f) => f !== field));
  }
  function copyToClipboard() {
    if (parsedData) {
      navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
      toast.success("📋 JSON copied to clipboard!");
    } else {
      toast.error(" cant copy");
    }
  }

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-br pt-[100px] from-green-100 to-white min-h-screen"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Toaster position="top-right" />

      <div className="flex-1 bg-green-50 p-6   rounded-2xl shadow-xl border border-green-200">
        <h1 className="text-3xl font-bold mb-6 text-green-800">
          Resume Parser
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-1">
              Input Mode
            </label>
            <div className="flex gap-4">
              {["file", "text"].map((mode) => (
                <label
                  key={mode}
                  className={`flex items-center gap-2 cursor-pointer font-medium ${
                    inputMode === mode ? "text-green-700" : "text-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    value={mode}
                    checked={inputMode === mode}
                    onChange={() => setInputMode(mode as "file" | "text")}
                  />
                  {mode === "file" ? "Upload File" : "Paste Text"}
                </label>
              ))}
            </div>
          </div>

          {inputMode === "file" ? (
            <div>
              <label className="block text-sm font-semibold text-green-700 mb-1">
                Upload Resume (pdf only)
              </label>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx,.txt"
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-300"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-green-700 mb-1">
                Paste Resume Text
              </label>
              <textarea
                name="resumeText"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-300"
                placeholder="Paste the resume text here..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-green-700 mb-1">
              Add Custom Field
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                placeholder="e.g. achievements"
                className="flex-grow p-2 border rounded focus:ring-2 focus:ring-green-300"
              />
              <button
                type="button"
                onClick={addCustomField}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
            {customFields.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customFields.map((field) => (
                  <span
                    key={field}
                    className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full"
                  >
                    {field}
                    <button
                      type="button"
                      onClick={() => removeCustomField(field)}
                      className="ml-2 text-sm font-bold hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-700 mb-1">
              Add Custom JSON Example
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCustomJsonEnabled(true)}
                className={`px-4 py-2 rounded font-medium ${
                  customJsonEnabled ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setCustomJsonEnabled(false)}
                className={`px-4 py-2 rounded font-medium ${
                  !customJsonEnabled ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
              >
                No
              </button>
            </div>
            {customJsonEnabled && (
              <textarea
                value={customJsonExample}
                onChange={(e) => setCustomJsonExample(e.target.value)}
                rows={8}
                required
                className="mt-3 w-full p-3 border rounded focus:ring-2 focus:ring-green-300"
                placeholder={`{
  "basics": { "name": "", "email": "", "phone": "" },
  "work": [{ "company": "", "position": "", "startDate": "", "endDate": "" }],
  "education": [{ "institution": "", "degree": "", "year": "" }],
  "skills": ["JavaScript", "Python", "React"],
  "awards": [{ "title": "", "date": "", "issuer": "" }]
}`}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? "Parsing..." : "Parse Resume"}
          </button>
        </form>
      </div>

      <div className="flex-1 bg-white p-0 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-800">Parsed JSON</h2>
          <button
            type="button"
            onClick={copyToClipboard}
            className="text-sm text-green-700 hover:text-green-900 font-medium flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h6l6 6v8a2 2 0 01-2 2h-2"
              />
            </svg>
            Copy
          </button>
        </div>
        <div
          className="p-6 overflow-y-auto"
          style={{ minHeight: "400px", maxHeight: "600px" }}
        >
          <pre className="whitespace-pre-wrap break-words text-sm text-gray-800">
            {parsedData
              ? JSON.stringify(parsedData, null, 2)
              : "Upload or paste a resume to see results."}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}
