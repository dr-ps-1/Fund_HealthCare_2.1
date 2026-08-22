import {
  DEMO_STAR_PATIENT_ID,
  DEMO_VITA_PATIENT_ID,
  isFullChartPatient,
} from "@/lib/demo-patients"
import type { Alert, Patient } from "@/lib/types"

export type ClinicalPriority = {
  id: string
  patientId: string
  patientName: string
  summary: string
  detail: string
  severity: "high" | "medium"
  supportsBrief: boolean
  rpmActive?: boolean
  updatedAt: string
}

const SEVERITY_RANK = { high: 0, medium: 1, low: 2 } as const

function pickTopActiveAlerts(alerts: Alert[]): Alert[] {
  const byPatient = new Map<string, Alert>()

  for (const alert of alerts) {
    if (alert.status !== "active") continue
    const existing = byPatient.get(alert.patientId)
    if (
      !existing ||
      SEVERITY_RANK[alert.severity] < SEVERITY_RANK[existing.severity]
    ) {
      byPatient.set(alert.patientId, alert)
    }
  }

  return [...byPatient.values()].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
  )
}

/** Action queue for the doctor home screen — derived from live panel alerts. */
export function computeClinicalPriorities(
  patients: Patient[],
  alerts: Alert[]
): ClinicalPriority[] {
  return pickTopActiveAlerts(alerts)
    .map((alert): ClinicalPriority => ({
      id: `cp-${alert.id}`,
      patientId: alert.patientId,
      patientName: alert.patientName,
      summary: alert.metric ?? alert.headline,
      detail: alert.cause,
      severity: alert.severity === "high" ? "high" : "medium",
      supportsBrief: isFullChartPatient(alert.patientId),
      rpmActive: alert.patientId === DEMO_VITA_PATIENT_ID,
      updatedAt: alert.time,
    }))
    .sort((a, b) => {
      if (a.patientId === DEMO_STAR_PATIENT_ID) return -1
      if (b.patientId === DEMO_STAR_PATIENT_ID) return 1
      return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
    })
}
