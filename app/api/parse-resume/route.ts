import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import extractTextFromPDF from "@/app/utils/pdfTextExtractor";
import { currentUser } from "@clerk/nextjs/server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  // console.log("📩 API HIT: /api/parse-resume");

  // getting current clerk user
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json(
      { error: "user not found in clerk " },
      { status: 404 }
    );
  }

  try {
    const formData = await req.formData();
    const resumeText = formData.get("resumeText") as string | null;
    const customFields = formData.getAll("customFields") as string[];
    const file = formData.get("resume") as File | null;
    const customExampleJson = formData.get("customJsonExample") as string;
    let text = resumeText?.trim() || "";

    // console.log("THIS IS BACKEND FORM DATA\n");
    // for (const [key, value] of formData.entries()) {
    //   console.log("Form Data Entry:", key, value);
    // }

    // 🧾 Extract PDF text if no manual text is provided
    if (file && file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Please upload under 5MB." },
        { status: 400 }
      );
    }

    if (!text && file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        text = await extractTextFromPDF(buffer);
        // console.log("📄 Extracted text from PDF:", text.slice(0, 50)); // Truncated log
      } catch (err) {
        console.error("❌ PDF text extraction failed:", err);
        return NextResponse.json(
          { error: "Failed to extract text from PDF." },
          { status: 400 }
        );
      }
    }

    if (!file && !text) {
      console.log("❌ No resume content provided");
      return NextResponse.json(
        { error: "No resume text or file provided." },
        { status: 400 }
      );
    }

    // const defaultExample = `{
    //      personal: {
    //        name: "",
    //        email: "",
    //        phone: "",
    //        location: "",
    //        summary: "",
    //      },
    //      education: [],
    //      work: [],
    //      skills: [],
    //      projects: [],
    //      achievements: [],
    //      certifications: [],
    //      interests: [],
    //      links: [],
    //      custom: {},
    //    }`;

    const defaultExample = `{
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: {
    degree: string;
    institution: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }[];
  work: {
    position: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
    techStack?: string[];
    link?: string;
  }[];
  achievements: string[];
  certifications: {
    name: string;
    issuer?: string;
    date?: string;
  }[];
  interests: string[];
  links: {
    type: string;
    url: string;
  }[];
  custom?: {
    languages?: string[];
    publications?: {
      title: string;
      publisher?: string;
      year?: string;
    }[];
    [key: string]: any;
  };
}
`;

    const schemaBlock = customExampleJson || defaultExample;
    const customFieldsNote = customFields?.length
      ? `Also try to extract these custom fields: ${customFields.join(
          ", "
        )}. JSON MUST HAVE THIS FIELD either with a value or NOT `
      : "";

    // ✅ Proceed with LLM prompt
    const prompt = `
You are a professional AI resume parser.

Extract structured information from the resume text below and return a **clean, valid JSON object only** — no extra text, markdown, or formatting. or "JsonData":{}

Required fields (extract if available, otherwise use null for missing fields):

Use this format:
${schemaBlock}

${customFieldsNote}

Resume:
"""
${text}
"""
  Return just the json with no extra commentaries and no backticks.
    `.trim();

    // console.log("🧠 Sending prompt to OpenRouter LLM...");
    const modelName =
      process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-8b-instruct:free";

    // console.log(" Model Using is ", modelName);

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 20000,
    });

    // const response = await openai.chat.completions.create({
    //   model: "nousresearch/deephermes-3-mistral-24b-preview:free",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.7,
    //   max_tokens: 20000,
    // });
    // const response = await openai.chat.completions.create({
    //   model: "meta-llama/llama-3.3-8b-instruct:free",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.7,
    //   max_tokens: 10000,
    // });

    const rawContent = response.choices[0].message.content?.trim() || "";
    let cleaned = rawContent;

    // After you get OpenAI response and tokens usage

    // after getting LLM response
    const { prompt_tokens, completion_tokens, total_tokens } =
      response.usage || {};

    // stat logic ------------------------------

    const userId = clerkUser.id;

    setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tokensPrompt: prompt_tokens,
          tokensCompletion: completion_tokens,
          totalTokens: total_tokens,
        }),
      });
    }, 0);

    // await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     userId,
    //     tokensPrompt: prompt_tokens,
    //     tokensCompletion: completion_tokens,
    //     totalTokens: total_tokens,
    //   }),
    // });

    // -----------------------------------
    // 🧹 Strip markdown if present
    if (cleaned.includes("```")) {
      cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, "$1").trim();
    }
    //
    // if (cleaned.startsWith("```")) {
    //   cleaned = cleaned
    //     .replace(/^```(?:json)?/, "")
    //     .replace(/```$/, "")
    //     .trim();
    // }

    try {
      const parsed = JSON.parse(cleaned);
      // console.log("✅ Parsed JSON from LLM:", parsed);
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("❌ Failed to parse JSON from LLM response:", err);
      return NextResponse.json(
        { error: "Failed to parse structured JSON." },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("💥 Server error:", error);
    return NextResponse.json(
      { error: "Resume parsing failed." },
      { status: 500 }
    );
  }
}
