import { NextResponse } from "next/server"
import { createGroqChatCompletion, isGroqConfigured } from "@/lib/groq-client"
import {
  mockLabExtract,
  parseLabExtractJson,
  type LabExtractResult,
} from "@/lib/lab-extract"
import { buildDemoLabReportText } from "@/lib/resolve-demo-dates"

export const runtime = "nodejs"

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

const EXTRACT_SYSTEM = `You extract lab/vital values from a US clinical lab report for a patient health dashboard.
Return ONLY valid JSON (no markdown) with this shape:
{
  "summary": string,
  "values": [
    {
      "metricId": "hba1c" | "bp" | "weight" | "glucose" | "other",
      "label": string,
      "value": string,
      "unit": string,
      "note": string
    }
  ],
  "suggestedHealthScore": number,
  "healthScoreExplanation": string
}
Rules:
- Prefer HbA1c, blood pressure, weight, fasting glucose when present.
- value should be the number or BP pair only (e.g. "9.1" or "146/90").
- suggestedHealthScore is 0–100 (higher = healthier). If labs are poor, score may drop slightly vs a baseline around 68.
- Do not invent values that are not in the report text.`

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { extractText } = await import("unpdf")
    const result = await extractText(new Uint8Array(buffer), { mergePages: true })
    const raw = result.text
    const text = Array.isArray(raw) ? raw.join("\n") : String(raw ?? "")
    return text.trim()
  } catch (error) {
    console.error("[extract-labs] PDF text extraction failed:", error)
    return ""
  }
}

async function extractWithGroq(reportText: string): Promise<LabExtractResult | null> {
  if (!isGroqConfigured()) return null
  try {
    const raw = await createGroqChatCompletion({
      temperature: 0.1,
      maxTokens: 700,
      messages: [
        { role: "system", content: EXTRACT_SYSTEM },
        {
          role: "user",
          content: `Extract structured labs from this report:\n\n${reportText.slice(0, 12000)}`,
        },
      ],
    })
    return parseLabExtractJson(raw)
  } catch (error) {
    console.error("[extract-labs] Groq failed:", error)
    return null
  }
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 })
  }

  const file = form.get("file")
  let reportText = ""
  let fileName = "document"
  let usedDemoFallbackText = false

  if (file instanceof File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 8 MB)" },
        { status: 413 }
      )
    }

    fileName = file.name
    const buffer = Buffer.from(await file.arrayBuffer())
    const lower = file.name.toLowerCase()

    if (lower.endsWith(".txt") || file.type.startsWith("text/")) {
      reportText = buffer.toString("utf8").trim()
    } else if (lower.endsWith(".pdf") || file.type === "application/pdf") {
      reportText = await extractPdfText(buffer)
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF or .txt lab report." },
        { status: 400 }
      )
    }
  }

  if (reportText.length < 40) {
    reportText = buildDemoLabReportText()
    usedDemoFallbackText = true
  }

  const groqResult = await extractWithGroq(reportText)
  const extract = groqResult ?? mockLabExtract()

  return NextResponse.json({
    extract,
    mode: groqResult ? "groq" : "mock",
    fileName,
    usedDemoFallbackText,
    reportChars: reportText.length,
  })
}
