import type { Alert } from "@/lib/types"
import type { InboxItem } from "@/lib/doctor-dashboard-data"
import { filterInboxForWorkqueue } from "@/lib/clinician-inbox-feed"

export type AlertQueueStats = {
  activeAlerts: number
  highSeverity: number
  inboxTasks: number
  inboxUrgent: number
}

export type AlertQueueFilter =
  | "all"
  | "high"
  | "medium"
  | "vitals"
  | "behavior"
  | "ai"

export type AlertsWorkqueueTab = "tasks" | "alerts"

export type GroupedPatientAlerts = {
  patientId: string
  patientName: string
  severity: Alert["severity"]
  alerts: Alert[]
}

const SEVERITY_RANK: Record<Alert["severity"], number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export function computeAlertQueueStats(
  alerts: Alert[],
  inbox: InboxItem[]
): AlertQueueStats {
  const active = alerts.filter((a) => a.status === "active")
  const tasks = filterInboxForWorkqueue(inbox)

  return {
    activeAlerts: active.length,
    highSeverity: active.filter((a) => a.severity === "high").length,
    inboxTasks: tasks.length,
    inboxUrgent: tasks.filter((i) => i.priority === "high").length,
  }
}

export function filterActiveAlerts(
  alerts: Alert[],
  queueFilter: AlertQueueFilter
): Alert[] {
  return alerts.filter((alert) => {
    if (alert.status !== "active") return false
    switch (queueFilter) {
      case "high":
        return alert.severity === "high"
      case "medium":
        return alert.severity === "medium"
      case "vitals":
        return alert.type === "vitals"
      case "behavior":
        return alert.type === "behavior"
      case "ai":
        return alert.type === "ai"
      default:
        return true
    }
  })
}

export function groupAlertsByPatient(alerts: Alert[]): GroupedPatientAlerts[] {
  const byPatient = new Map<string, Alert[]>()

  for (const alert of alerts) {
    const list = byPatient.get(alert.patientId) ?? []
    list.push(alert)
    byPatient.set(alert.patientId, list)
  }

  return Array.from(byPatient.entries())
    .map(([patientId, patientAlerts]) => {
      const sorted = [...patientAlerts].sort(
        (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
      )
      return {
        patientId,
        patientName: sorted[0].patientName,
        severity: sorted[0].severity,
        alerts: sorted,
      }
    })
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])
}

export function parseAlertFilterFromParams(params: {
  severity?: string | null
  type?: string | null
}): AlertQueueFilter {
  if (params.type === "vitals") return "vitals"
  if (params.type === "behavior") return "behavior"
  if (params.type === "ai") return "ai"
  if (params.severity === "high") return "high"
  if (params.severity === "medium") return "medium"
  return "all"
}

export function parseAlertsWorkqueueTab(
  tab?: string | null,
  hash?: string | null
): AlertsWorkqueueTab {
  if (tab === "alerts" || tab === "tasks") return tab
  if (hash === "#tasks") return "tasks"
  return "tasks"
}

export function buildAlertsWorkqueueSearchParams(input: {
  tab?: AlertsWorkqueueTab
  filter?: AlertQueueFilter
}): string {
  const params = new URLSearchParams()

  if (input.tab === "alerts") {
    params.set("tab", "alerts")
  }

  if (input.filter && input.filter !== "all") {
    if (input.filter === "high" || input.filter === "medium") {
      params.set("severity", input.filter)
    } else {
      params.set("type", input.filter)
    }
  }

  const query = params.toString()
  return query ? `?${query}` : ""
}
