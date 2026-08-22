import type { PatientHealthProfile, PatientMetric } from "@/lib/patient-health-profile"

export type ExtractedLabValue = {
  metricId: "hba1c" | "bp" | "weight" | "glucose" | "other"
  label: string
  value: string
  unit?: string
  note?: string
}

export type LabExtractResult = {
  summary: string
  values: ExtractedLabValue[]
  suggestedHealthScore?: number
  healthScoreExplanation?: string
}

export function mockLabExtract(): LabExtractResult {
  return {
    summary:
      "Lab panel shows fasting glucose 186 mg/dL and HbA1c 9.1%. Clinic BP 146/90. Profile metrics updated for demo.",
    values: [
      {
        metricId: "hba1c",
        label: "HbA1c",
        value: "9.1",
        unit: "%",
        note: "From uploaded lab report",
      },
      {
        metricId: "bp",
        label: "Blood pressure",
        value: "146/90",
        unit: "mmHg",
        note: "Clinic reading on report",
      },
      {
        metricId: "weight",
        label: "Weight",
        value: "177",
        unit: "lbs",
        note: "Clinic weight on report",
      },
      {
        metricId: "glucose",
        label: "Fasting glucose",
        value: "186",
        unit: "mg/dL",
        note: "New lab value from upload",
      },
    ],
    suggestedHealthScore: 66,
    healthScoreExplanation:
      "Score nudged down after the uploaded labs: HbA1c 9.1% and fasting glucose 186 remain above goal.",
  }
}

export function applyLabExtractToProfile(
  profile: PatientHealthProfile,
  extract: LabExtractResult
): PatientHealthProfile {
  const metrics = [...profile.metrics]
  const touched = new Set<string>()

  for (const v of extract.values) {
    if (v.metricId === "other" || v.metricId === "glucose") {
      const existingGlucose = metrics.find((m) => m.id === "glucose")
      if (v.metricId === "glucose" || v.label.toLowerCase().includes("glucose")) {
        const next: PatientMetric = {
          id: "glucose",
          label: "Fasting glucose",
          value: v.value,
          unit: v.unit ?? "mg/dL",
          normalRange: "70–99 mg/dL",
          trend: "up",
          trendLabel: v.note ?? "From lab upload",
          status: "high",
        }
        if (existingGlucose) {
          Object.assign(existingGlucose, next)
        } else {
          metrics.unshift(next)
        }
        touched.add("glucose")
      }
      continue
    }

    const idx = metrics.findIndex((m) => m.id === v.metricId)
    if (idx === -1) continue
    metrics[idx] = {
      ...metrics[idx],
      value: v.value,
      unit: v.unit ?? metrics[idx].unit,
      trend: "up",
      trendLabel: v.note ?? "Updated from lab upload",
      status: v.metricId === "hba1c" || v.metricId === "bp" ? "high" : "watch",
    }
    touched.add(v.metricId)
  }

  return {
    ...profile,
    metrics,
    healthScore: extract.suggestedHealthScore ?? profile.healthScore,
    healthScoreTrend: "down",
    healthScoreExplanation:
      extract.healthScoreExplanation ?? profile.healthScoreExplanation,
  }
}

export function parseLabExtractJson(raw: string): LabExtractResult | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()
    const parsed = JSON.parse(cleaned) as LabExtractResult
    if (!parsed.summary || !Array.isArray(parsed.values)) return null
    return parsed
  } catch {
    return null
  }
}
