import type { Patient } from "@/lib/types"
import { SARAH_VISIT_GAP_DAYS } from "@/lib/patient-health-profile"

export type PanelQualityMetric = {
  id: string
  label: string
  valuePercent: number
  detail: string
  href: string
  status: "on-track" | "needs-attention" | "critical"
}

function parseA1c(keyMetric: string): number | null {
  const match = keyMetric.match(/HbA1c\s+([\d.]+)/i)
  return match ? Number.parseFloat(match[1]) : null
}

/** HEDIS-style panel performance — derived from attributed panel. */
export function computePanelQualityMetrics(
  patients: Patient[]
): PanelQualityMetric[] {
  const diabetes = patients.filter((p) =>
    /diabetes/i.test(p.condition + p.diagnosis)
  )
  const atA1cGoal = diabetes.filter((p) => {
    const a1c = parseA1c(p.keyMetric)
    return a1c !== null && a1c < 8
  })
  const a1cPercent =
    diabetes.length > 0
      ? Math.round((atA1cGoal.length / diabetes.length) * 100)
      : 0

  const hypertension = patients.filter((p) =>
    /hypertension|heart failure|cardiovascular/i.test(p.condition + p.diagnosis)
  )
  const atBpGoal = hypertension.filter((p) => p.status === "green")
  const bpPercent =
    hypertension.length > 0
      ? Math.round((atBpGoal.length / hypertension.length) * 100)
      : 0

  const medicareEligible = patients.filter((p) => p.age >= 65)
  const awvCurrent = medicareEligible.filter((p) => p.daysSinceVisit <= 365)
  const awvPercent =
    medicareEligible.length > 0
      ? Math.round((awvCurrent.length / medicareEligible.length) * 100)
      : 0

  return [
    {
      id: "qm-a1c",
      label: "A1c at goal (<8%)",
      valuePercent: a1cPercent,
      detail: `${atA1cGoal.length} of ${diabetes.length} diabetes members`,
      href: "/patients?status=red",
      status:
        a1cPercent < 50
          ? "critical"
          : a1cPercent < 70
            ? "needs-attention"
            : "on-track",
    },
    {
      id: "qm-bp",
      label: "BP control (<140/90)",
      valuePercent: bpPercent,
      detail: `${atBpGoal.length} of ${hypertension.length} HTN/CV members`,
      href: "/patients?filter=rpm",
      status:
        bpPercent < 60
          ? "needs-attention"
          : bpPercent >= 75
            ? "on-track"
            : "needs-attention",
    },
    {
      id: "qm-awv",
      label: "AWV current (12 mo)",
      valuePercent: awvPercent,
      detail: `${medicareEligible.length - awvCurrent.length} Medicare AWV overdue`,
      href: "/patients?filter=overdue",
      status: awvPercent < 70 ? "needs-attention" : "on-track",
    },
  ]
}

export function getPanelQualitySummaryLine(patients: Patient[]): string {
  const overdue = patients.filter((p) => p.daysSinceVisit >= 60).length
  return `${overdue} members overdue for visit (60d+) · longest gap ${SARAH_VISIT_GAP_DAYS} days`
}
