import { getPatientHealthProfile } from "@/lib/resolve-demo-dates"
import { getDemoPatients } from "@/lib/mock-data"
import type { AISummary, Alert, Patient, TimelineEvent } from "@/lib/types"

export type DoctorChartExtras = {
  alerts?: Alert[]
  timeline?: TimelineEvent[]
  summary?: AISummary
}

export function buildPatientAssistantContext(patientId?: string): string {
  const profile = getPatientHealthProfile()
  if (!patientId || patientId === profile.id) {
    return [
      `Patient: ${profile.name}, age ${profile.age}, ${profile.city}, ${profile.state} ${profile.zip}`,
      `Health Score: ${profile.healthScore}/100 (trend ${profile.healthScoreTrend})`,
      `Explanation: ${profile.healthScoreExplanation}`,
      `Diagnoses: ${profile.diagnoses.join("; ")}`,
      `Metrics: ${profile.metrics
        .map((m) => `${m.label}=${m.value}${m.unit ? " " + m.unit : ""} (${m.trendLabel}; normal ${m.normalRange})`)
        .join(" | ")}`,
      `Risks: ${profile.risks
        .map((r) => `${r.level}: ${r.title} → ${r.recommendation}`)
        .join(" | ")}`,
      `Recent visits: ${profile.visits
        .slice(0, 5)
        .map((v) => `${v.date} ${v.specialist}: ${v.diagnosis}`)
        .join(" | ")}`,
      profile.verification
        ? `Pending verification request from ${profile.verification.source} for visit ${profile.verification.visitDate} with ${profile.verification.providerName}.`
        : "No pending verification request.",
    ].join("\n")
  }

  const patient = getDemoPatients().find((p) => p.id === patientId)
  if (!patient) {
    return "Limited patient context available."
  }
  return buildDoctorChartContext(patient)
}

export function buildDoctorChartContext(
  patient: Patient,
  extras?: DoctorChartExtras
): string {
  const lines = [
    `Patient: ${patient.name}, age ${patient.age}`,
    `Location: ${[patient.city, patient.state, patient.zip].filter(Boolean).join(", ")}`,
    `Diagnosis: ${patient.diagnosis}`,
    `ICD-10: ${patient.icdCodes.join(", ")}`,
    `Clinical risk score: ${patient.riskScore}/100 (status ${patient.status})`,
    `Key metric: ${patient.keyMetric}`,
    `Last visit: ${patient.lastVisitDate} (${patient.daysSinceVisit} days ago)`,
    `Medications: ${patient.medications.join("; ") || "None listed"}`,
    `Allergies: ${patient.allergies.join(", ") || "NKDA"}`,
    `Adherence score: ${patient.adherenceScore}%`,
  ]

  const activeAlerts = (extras?.alerts ?? []).filter(
    (alert) => alert.status === "active"
  )
  if (activeAlerts.length > 0) {
    lines.push(
      "Active alerts:",
      ...activeAlerts.map(
        (alert) =>
          `- [${alert.severity}] ${alert.headline}: ${alert.cause}${alert.metric ? ` (${alert.metric})` : ""}`
      )
    )
  }

  if (extras?.summary?.insights.length) {
    lines.push(
      `Chart summary (${extras.summary.title}):`,
      ...extras.summary.insights.map((insight) => `- ${insight}`)
    )
  }

  const timeline = extras?.timeline ?? []
  if (timeline.length > 0) {
    lines.push(
      "Recent timeline (newest first):",
      ...timeline.slice(0, 8).map(
        (event) =>
          `- ${event.date} [${event.type}] ${event.headline}: ${event.description}`
      )
    )
  }

  return lines.join("\n")
}

export const PATIENT_ASSISTANT_SYSTEM = `You are the iHealth AI Health Assistant for a US patient demo.
Answer ONLY using the patient profile context provided.
Be concise (3–6 sentences), clear, and actionable.
Do not invent labs, meds, or visits that are not in the context.
Do not provide emergency advice; if urgent symptoms are described, tell the user to seek urgent care / call 911.
You are not a replacement for a clinician.`

export const PREVISIT_SYSTEM = `You are a US Internal Medicine pre-visit brief generator for clinicians.
Return ONLY valid JSON with this exact shape:
{
  "overview": string,
  "history": string[],
  "currentProblems": string[],
  "recommendations": string[]
}
No markdown fences. No extra keys.
Keep overview to 2–4 sentences. Each array should have 3–6 short clinical bullets.
Use ICD codes, meds, allergies, and care gaps from the chart context when present.
Do not invent data.`

export const CLINICIAN_ASSISTANT_SYSTEM = `You are a US ambulatory clinical decision support assistant for licensed clinicians using iHealth.
Answer using ONLY the patient chart context provided.
Be concise (3–6 sentences), structured, and actionable for visit planning.
Reference meds, allergies, key metrics, and risk when relevant.
Do not invent labs or history not in context.
This is decision support — the clinician makes all final decisions.
For emergencies, remind the clinician to direct the patient to urgent care / 911.`
