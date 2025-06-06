"use client";
import * as React from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const features = [
    "Extract data from PDFs, DOCX, images, and scans",
    "Customize fields with your preferred schema",
    "Get JSON/CSV/Excel output instantly",
    "Powerful API for developers",
    "Fast and accurate AI-powered parser",
    "Built-in OCR for image-based resumes",
  ];

  const comparisons = [
    ["Accuracy", "~98% across formats", "70–85% limited formats"],
    ["OCR Support", "Yes (built-in)", "Rare or limited"],
    ["Custom Schema", "Fully configurable", "Mostly fixed fields"],
    ["Export Formats", "JSON, CSV, Excel", "CSV only"],
    ["API & Automation", "Full API + Webhooks", "Basic or none"],
    ["Free Plan", "Yes, up to 100 resumes", "Trial-only or limited"],
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen w-full flex flex-col justify-center items-center text-center bg-gradient-to-b from-white to-green-50 p-10">
        <motion.h1
          className="text-5xl font-bold max-w-4xl"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Extract Structured Data from Resumes Instantly
        </motion.h1>
        <motion.p
          className="text-gray-600 mt-6 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Upload resumes, define your schema, and receive clean, structured JSON
          data. Fast, accurate, and customizable for recruiters, HR tools, and
          developers.
        </motion.p>
        <motion.div
          className="mt-8 flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <button
            className="bg-green-600 text-white rounded-xl px-6 py-3 text-lg hover:bg-green-700 transition"
            onClick={() => (window.location.href = "/subscribe")}
          >
            Subscribe Now
          </button>
          <button
            className="border border-green-600 text-green-600 rounded-xl px-6 py-3 text-lg hover:bg-green-100 transition"
            onClick={() => (window.location.href = "/sign-up")}
          >
            Try for Free
          </button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="about"
        className="w-full py-24 px-6 bg-gradient-to-r from-green-50 to-white"
      >
        <motion.div
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-10">
            Why Choose Our Resume Parser?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((text, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white shadow-xl rounded-2xl p-6 text-lg text-gray-700 hover:shadow-2xl"
              >
                {text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Comparison Section */}
      <section className="w-full py-24 px-6 bg-gradient-to-br from-green-100 to-white">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-10">How We Compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 text-left">
              <thead>
                <tr className="bg-green-100">
                  <th className="p-4">Feature</th>
                  <th className="p-4">Our Parser</th>
                  <th className="p-4">Other Platforms</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisons.map(([feature, ours, others], idx) => (
                  <tr key={idx}>
                    <td className="p-4 font-semibold">{feature}</td>
                    <td className="p-4 text-green-700">{ours}</td>
                    <td className="p-4 text-gray-700">{others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-green-600 py-20 px-6 text-white text-center">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-6">
            Start Parsing Resumes Today
          </h2>
          <p className="text-lg mb-8">
            Join recruiters and developers already transforming resumes into
            structured data. Try it free or unlock full features by subscribing.
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="bg-white text-green-600 font-semibold px-6 py-3 rounded-xl hover:bg-green-100 transition"
              onClick={() => (window.location.href = "/subscribe")}
            >
              Subscribe Now
            </button>
            <button
              className="border border-white text-white px-6 py-3 rounded-xl hover:bg-white hover:text-green-600 transition"
              onClick={() => (window.location.href = "/sign-up")}
            >
              Try for Free
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
