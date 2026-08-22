import type { Patient, PreVisitBrief } from "@/lib/types"

export type PreVisitBriefMode = "groq" | "mock" | "fallback"

export type StoredPreVisitBrief = {
  brief: PreVisitBrief
  mode: PreVisitBriefMode
  generatedAt: string
}

export function buildFallbackPreVisitBrief(patient: Patient): PreVisitBrief {
  return {
    patientId: patient.id,
    overview: `${patient.name}, ${patient.age} — ${patient.diagnosis}. Risk score ${patient.riskScore}; ${patient.daysSinceVisit} days since last visit.`,
    history: [
      `ICD-10: ${patient.icdCodes.join(", ") || "—"}`,
      `Last visit: ${patient.lastVisitDate} (${patient.daysSinceVisit} days ago)`,
      `Medications: ${patient.medications.join("; ") || "None listed"}`,
      `Allergies: ${patient.allergies.join(", ") || "NKDA"}`,
    ],
    currentProblems: [
      `Key metric: ${patient.keyMetric}`,
      `Panel status driven by risk score ${patient.riskScore}`,
    ],
    recommendations: [
      "Review meds and allergies at visit start",
      "Address care gaps and schedule follow-up",
      "Document shared decision-making in note",
    ],
  }
}

export function formatPreVisitProvenance(
  mode: PreVisitBriefMode,
  generatedAt: string
): string {
  const when = new Date(generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
  const source =
    mode === "groq" ? "AI-generated" : mode === "mock" ? "Curated template" : "Chart fallback"
  return `Generated ${when} · ${source}`
}

export function formatPreVisitBriefAsText(
  patient: Patient,
  brief: PreVisitBrief,
  provenance?: { mode: PreVisitBriefMode; generatedAt: string }
): string {
  const lines = [
    `PRE-VISIT BRIEF — ${patient.name}`,
    `${patient.diagnosis} · Risk score ${patient.riskScore}/100`,
    patient.keyMetric ? `Key metric: ${patient.keyMetric}` : "",
    "",
    "OVERVIEW",
    brief.overview,
    "",
    "HISTORY",
    ...brief.history.map((item) => `• ${item}`),
    "",
    "CURRENT PROBLEMS",
    ...brief.currentProblems.map((item) => `• ${item}`),
    "",
    "RECOMMENDATIONS",
    ...brief.recommendations.map((item) => `• ${item}`),
  ].filter((line) => line !== "")

  if (provenance) {
    lines.push("", formatPreVisitProvenance(provenance.mode, provenance.generatedAt))
  }

  lines.push("", "Decision support only — verify before clinical action.")
  return lines.join("\n")
}
