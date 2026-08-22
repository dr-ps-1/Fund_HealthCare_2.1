import { NextResponse } from "next/server"
import { CLINICIAN_ASSISTANT_SYSTEM } from "@/lib/ai-context"
import { resolveClinicianPanelPatient } from "@/lib/clinician-patient-resolve"
import { buildPreVisitChartContext } from "@/lib/previsit-chart-context"
import { createGroqChatCompletion, getGroqConfigStatus, isGroqConfigured } from "@/lib/groq-client"
import type { Patient } from "@/lib/types"

type Body = {
  message?: string
  patientId?: string
  history?: { role: "user" | "assistant"; content: string }[]
}

function buildGroqMessages(
  context: string,
  message: string,
  history: Body["history"]
) {
  const prior =
    history
      ?.filter((item) => item.content.trim())
      .slice(-8)
      .map((item) => ({
        role: item.role,
        content: item.content.trim(),
      })) ?? []

  return [
    { role: "system" as const, content: CLINICIAN_ASSISTANT_SYSTEM },
    { role: "system" as const, content: `Patient chart context:\n${context}` },
    ...prior,
    { role: "user" as const, content: message },
  ]
}

function mockClinicianReply(message: string, patient: Patient): string {
  const lower = message.toLowerCase()
  if (lower.includes("hba1c") || lower.includes("a1c")) {
    return `${patient.name}'s key metric is ${patient.keyMetric}. For T2DM members above goal, consider med intensification, adherence review, and repeat labs in 3 months per ADA-style follow-up.`
  }
  if (lower.includes("blood pressure") || lower.includes("bp")) {
    return `Review home BP trend against ${patient.keyMetric}. If elevated on repeat readings, confirm adherence and consider dose adjustment; document shared decision-making in the chart note.`
  }
  if (lower.includes("visit") || lower.includes("follow")) {
    return `Last visit was ${patient.lastVisitDate} (${patient.daysSinceVisit} days ago). Given risk score ${patient.riskScore}, prioritize closing visit gap and reconciling meds at the next encounter.`
  }
  if (lower.includes("med") || lower.includes("drug")) {
    return `Current meds: ${patient.medications.join("; ") || "none listed"}. Allergies: ${patient.allergies.join(", ") || "NKDA"}. Reconcile at visit and check for interactions before changes.`
  }
  return `For ${patient.name} (${patient.diagnosis}): focus on ${patient.keyMetric}, adherence (${patient.adherenceScore}%), and ${patient.daysSinceVisit}-day visit gap. Ask about specific metrics, meds, or visit planning for tailored guidance.`
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body
  const message = body.message?.trim()
  const patientId = body.patientId

  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 })
  }
  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 })
  }

  const patient = await resolveClinicianPanelPatient(patientId)
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 })
  }

  const context = await buildPreVisitChartContext(patient)

  if (isGroqConfigured()) {
    try {
      const reply = await createGroqChatCompletion({
        temperature: 0.25,
        maxTokens: 600,
        messages: buildGroqMessages(context, message, body.history),
      })
      return NextResponse.json({
        reply,
        mode: "groq",
        patientId,
      })
    } catch (error) {
      console.error("[ai/clinician-assistant] Groq failed, using mock:", error)
      return NextResponse.json({
        reply: mockClinicianReply(message, patient),
        mode: "mock",
        patientId,
        groqFallback: true,
        groqError:
          error instanceof Error ? error.message : "Groq request failed",
      })
    }
  }

  const groqStatus = getGroqConfigStatus()
  return NextResponse.json({
    reply: mockClinicianReply(message, patient),
    mode: "mock",
    patientId,
    groqConfigured: false,
    groqHint: groqStatus.hint,
  })
}
