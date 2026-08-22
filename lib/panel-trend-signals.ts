import type { PanelTrendSignal } from "@/lib/doctor-dashboard-data"
import type { Alert, Patient } from "@/lib/types"

const PANEL_TREND_LIMIT = 2

function isDiabetesPatient(patient: Patient): boolean {
  const text = `${patient.condition} ${patient.diagnosis}`.toLowerCase()
  return /diabetes|t2dm|dm\b/.test(text)
}

/** Cohort-level signals for the doctor home — max 2, no patient names. */
export function computePanelTrendSignals(
  patients: Patient[],
  alerts: Alert[]
): PanelTrendSignal[] {
  const candidates: PanelTrendSignal[] = []

  const diabetes = patients.filter(isDiabetesPatient)
  const offTargetDiabetes = diabetes.filter(
    (p) => p.status === "red" || p.status === "yellow"
  )
  if (diabetes.length > 0 && offTargetDiabetes.length > 0) {
    candidates.push({
      id: "trend-diabetes",
      text: `Diabetes cohort: ${offTargetDiabetes.length} of ${diabetes.length} members off glycemic target`,
      severity: offTargetDiabetes.some((p) => p.status === "red")
        ? "high"
        : "medium",
      href: "/patients?status=red",
    })
  }

  const overdueVisits = patients.filter((p) => p.daysSinceVisit >= 60)
  if (overdueVisits.length > 0) {
    candidates.push({
      id: "trend-visit-gaps",
      text: `Chronic follow-up: ${overdueVisits.length} attributed member${
        overdueVisits.length === 1 ? "" : "s"
      } overdue 60+ days`,
      severity: overdueVisits.some((p) => p.daysSinceVisit >= 90)
        ? "high"
        : "medium",
      href: "/patients?filter=overdue",
    })
  }

  const vitalsAlerts = alerts.filter(
    (a) => a.status === "active" && a.type === "vitals"
  )
  if (vitalsAlerts.length > 0) {
    candidates.push({
      id: "trend-rpm-vitals",
      text: `Remote monitoring: ${vitalsAlerts.length} member${
        vitalsAlerts.length === 1 ? "" : "s"
      } with out-of-range home readings`,
      severity: vitalsAlerts.some((a) => a.severity === "high")
        ? "high"
        : "medium",
      href: "/patients?filter=rpm",
    })
  }

  const lowAdherence = patients.filter((p) => p.adherenceScore < 70)
  if (lowAdherence.length > 0) {
    candidates.push({
      id: "trend-adherence",
      text: `Medication adherence: ${lowAdherence.length} member${
        lowAdherence.length === 1 ? "" : "s"
      } below 70%`,
      severity: lowAdherence.some((p) => p.adherenceScore < 50)
        ? "high"
        : "medium",
      href: "/patients?filter=attention",
    })
  }

  candidates.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === "high" ? -1 : 1
    }
    return 0
  })

  return candidates.slice(0, PANEL_TREND_LIMIT)
}
