import { NextResponse } from "next/server"
import {
  PATIENT_ASSISTANT_SYSTEM,
  buildPatientAssistantContext,
} from "@/lib/ai-context"
import { createGroqChatCompletion, getGroqConfigStatus, isGroqConfigured } from "@/lib/groq-client"
import { SARAH_VISIT_GAP_DAYS } from "@/lib/patient-health-profile"
import { getPatientHealthProfile } from "@/lib/resolve-demo-dates"

type Body = {
  message?: string
  patientId?: string
}

function mockAssistantReply(message: string): string {
  const lower = message.toLowerCase()
  const p = getPatientHealthProfile()
  const lastVisit = p.visits[0]
  const lastVisitLabel = lastVisit
    ? `${lastVisit.date} (${SARAH_VISIT_GAP_DAYS} days ago)`
    : `about ${SARAH_VISIT_GAP_DAYS} days ago`
  if (lower.includes("hba1c") || lower.includes("a1c")) {
    return `Your latest HbA1c is 9.2% (goal usually under 7%). That means average blood sugar has been high over ~3 months. Combined with ${p.diagnoses.join(" and ")}, this is the main reason your Health Score is ${p.healthScore}.`
  }
  if (lower.includes("blood pressure") || lower.includes("bp")) {
    return `Recent home readings are around 148/92 — above the common target under 130/80 for many adults with diabetes. Keep taking Lisinopril as prescribed and bring a 7-day log to your next visit.`
  }
  if (lower.includes("next visit") || lower.includes("when")) {
    return `You are overdue for chronic-care follow-up (last visit ${lastVisitLabel}). Scheduling this week is recommended given your HbA1c and BP trend.`
  }
  if (lower.includes("score") || lower.includes("improve")) {
    return `To improve your Health Score from ${p.healthScore}: (1) book follow-up, (2) steady Metformin adherence, (3) morning BP log, (4) add walking toward 6,000 steps. Small weekly gains compound.`
  }
  if (
    lower.includes("risk") ||
    lower.includes("high") ||
    lower.includes("why")
  ) {
    return `Risk looks elevated mainly because HbA1c stayed above goal for 3 months, home BP is trending up, and it has been ${SARAH_VISIT_GAP_DAYS} days since your last clinic visit. Addressing those three levers usually moves the score fastest.`
  }
  return `Based on your profile (Health Score ${p.healthScore}, ${p.diagnoses.join(", ")}): focus on glycemic control, BP logging, and booking the overdue visit. Ask me about HbA1c, blood pressure, or your next visit for details.`
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body
  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 })
  }

  const patientId = body.patientId ?? getPatientHealthProfile().id
  const context = buildPatientAssistantContext(patientId)

  if (isGroqConfigured()) {
    try {
      const reply = await createGroqChatCompletion({
        temperature: 0.3,
        maxTokens: 500,
        messages: [
          { role: "system", content: PATIENT_ASSISTANT_SYSTEM },
          {
            role: "system",
            content: `Patient profile context:\n${context}`,
          },
          { role: "user", content: message },
        ],
      })
      return NextResponse.json({
        reply,
        mode: "groq",
        patientId,
      })
    } catch (error) {
      console.error("[ai/assistant] Groq failed, using mock:", error)
    }
  }

  return NextResponse.json({
    reply: mockAssistantReply(message),
    mode: "mock",
    patientId,
  })
}

export async function GET() {
  const groq = getGroqConfigStatus()
  return NextResponse.json({
    groqConfigured: groq.configured,
    groqReason: groq.reason,
    groqHint: groq.hint,
    groqModel: groq.model,
  })
}
