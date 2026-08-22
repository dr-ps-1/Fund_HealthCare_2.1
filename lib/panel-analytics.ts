import type { Alert, Patient } from "@/lib/types"
import { DEMO_VITA_PATIENT_ID } from "@/lib/demo-patients"
import { computePanelQualityMetrics } from "@/lib/panel-quality-metrics"
import { buildPanelRosterSearchParams } from "@/lib/panel-roster"

export type ConditionCount = {
  name: string
  count: number
  color: string
  href: string
}

export type StatusSlice = {
  name: string
  value: number
  color: string
  href: string
}

export type RiskTierSlice = {
  name: string
  value: number
  color: string
  href: string
}

export type RpmAnalyticsSummary = {
  enrolled: number
  withActiveVitalsAlert: number
  deviceSyncLabel: string
  href: string
}

const CONDITION_COLORS: Record<string, string> = {
  "Diabetes Type 2": "#2563EB",
  Cardiovascular: "#DC2626",
  COPD: "#F59E0B",
  Hypertension: "#16A34A",
}

const STATUS_COLORS = {
  green: "#16A34A",
  yellow: "#F59E0B",
  red: "#DC2626",
}

function conditionHref(condition: string): string {
  return `/patients${buildPanelRosterSearchParams({ condition })}`
}

export function computePanelConditionDistribution(
  patients: Patient[]
): ConditionCount[] {
  const counts = new Map<string, number>()

  for (const patient of patients) {
    counts.set(patient.condition, (counts.get(patient.condition) ?? 0) + 1)
  }

  return [...counts.entries()].map(([name, count]) => ({
    name,
    count,
    color: CONDITION_COLORS[name] ?? "#6B7280",
    href: conditionHref(name),
  }))
}

export function computePanelStatusDistribution(
  patients: Patient[]
): StatusSlice[] {
  const labels = {
    green: "Stable",
    yellow: "Attention",
    red: "Urgent",
  } as const

  const hrefs = {
    green: "/patients",
    yellow: "/patients?filter=attention",
    red: "/patients?filter=urgent",
  } as const

  return (["green", "yellow", "red"] as const).map((status) => ({
    name: labels[status],
    value: patients.filter((p) => p.status === status).length,
    color: STATUS_COLORS[status],
    href: hrefs[status],
  }))
}

export function computePanelRiskDistribution(
  patients: Patient[]
): RiskTierSlice[] {
  const high = patients.filter((p) => p.riskScore >= 70).length
  const medium = patients.filter(
    (p) => p.riskScore >= 40 && p.riskScore < 70
  ).length
  const low = patients.filter((p) => p.riskScore < 40).length

  return [
    {
      name: "High (70+)",
      value: high,
      color: "#DC2626",
      href: "/patients?filter=urgent",
    },
    {
      name: "Moderate (40–69)",
      value: medium,
      color: "#F59E0B",
      href: "/patients?filter=attention",
    },
    {
      name: "Lower (<40)",
      value: low,
      color: "#16A34A",
      href: "/patients",
    },
  ]
}

export function computeRpmAnalyticsSummary(
  patients: Patient[],
  alerts: Alert[]
): RpmAnalyticsSummary {
  const enrolled = patients.filter((p) => p.id === DEMO_VITA_PATIENT_ID)
  const activeVitalsAlerts = alerts.filter(
    (alert) =>
      alert.status === "active" &&
      alert.type === "vitals" &&
      enrolled.some((p) => p.id === alert.patientId)
  )

  return {
    enrolled: enrolled.length,
    withActiveVitalsAlert: activeVitalsAlerts.length,
    deviceSyncLabel:
      enrolled.length > 0 ? "Last device sync within 24h (demo)" : "No enrolled members",
    href: "/patients?filter=rpm",
  }
}

export function computePanelAnalyticsSummary(
  patients: Patient[],
  alerts: Alert[]
) {
  const quality = computePanelQualityMetrics(patients)
  const rpm = computeRpmAnalyticsSummary(patients, alerts)

  return {
    panelSize: patients.length,
    avgRisk:
      patients.length > 0
        ? Math.round(
            patients.reduce((sum, p) => sum + p.riskScore, 0) / patients.length
          )
        : 0,
    urgent: patients.filter((p) => p.status === "red").length,
    a1cAtGoal: quality.find((q) => q.id === "qm-a1c")?.valuePercent ?? 0,
    bpControl: quality.find((q) => q.id === "qm-bp")?.valuePercent ?? 0,
    rpmEnrolled: rpm.enrolled,
  }
}

export function getAttributionPeriodLabel(date = new Date()): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1
  return `Q${quarter} ${date.getFullYear()}`
}
