import { NextResponse } from "next/server"
import { PREVISIT_SYSTEM } from "@/lib/ai-context"
import { resolveClinicianPanelPatient } from "@/lib/clinician-patient-resolve"
import { DEMO_STAR_PATIENT_ID } from "@/lib/demo-patients"
import { createGroqChatCompletion, isGroqConfigured } from "@/lib/groq-client"
import { getPreVisitBriefs } from "@/lib/mock-data"
import { buildPreVisitChartContext } from "@/lib/previsit-chart-context"
import {
  buildFallbackPreVisitBrief,
  type PreVisitBriefMode,
} from "@/lib/previsit-brief"
import type { PreVisitBrief } from "@/lib/types"

type Body = { patientId?: string }

function parseBriefJson(
  raw: string,
  patientId: string
): PreVisitBrief | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()
    const parsed = JSON.parse(cleaned) as Partial<PreVisitBrief>
    if (
      typeof parsed.overview !== "string" ||
      !Array.isArray(parsed.history) ||
      !Array.isArray(parsed.currentProblems) ||
      !Array.isArray(parsed.recommendations)
    ) {
      return null
    }
    return {
      patientId,
      overview: parsed.overview,
      history: parsed.history.map(String),
      currentProblems: parsed.currentProblems.map(String),
      recommendations: parsed.recommendations.map(String),
    }
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const started = Date.now()
  const body = (await request.json().catch(() => ({}))) as Body
  const patientId = body.patientId ?? DEMO_STAR_PATIENT_ID
  const patient = await resolveClinicianPanelPatient(patientId)

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 })
  }

  const chartContext = await buildPreVisitChartContext(patient)
  let mode: PreVisitBriefMode = "mock"

  if (isGroqConfigured()) {
    try {
      const raw = await createGroqChatCompletion({
        temperature: 0.2,
        maxTokens: 900,
        messages: [
          { role: "system", content: PREVISIT_SYSTEM },
          {
            role: "user",
            content: `Generate a pre-visit brief JSON for this chart:\n${chartContext}`,
          },
        ],
      })
      const brief = parseBriefJson(raw, patientId)
      if (brief) {
        return NextResponse.json({
          brief,
          mode: "groq" satisfies PreVisitBriefMode,
          generatedAt: new Date().toISOString(),
          generatedInMs: Date.now() - started,
        })
      }
      console.error("[ai/previsit] Groq returned unparseable JSON", {
        length: raw.length,
      })
    } catch (error) {
      console.error("[ai/previsit] Groq failed, using mock:", error)
    }
  }

  const brief =
    getPreVisitBriefs()[patientId] ?? buildFallbackPreVisitBrief(patient)
  if (!getPreVisitBriefs()[patientId]) {
    mode = "fallback"
  }

  return NextResponse.json({
    brief,
    mode,
    generatedAt: new Date().toISOString(),
    generatedInMs: Date.now() - started,
  })
}
