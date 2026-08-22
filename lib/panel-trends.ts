import type { Alert, Patient } from "@/lib/types"
import { computePanelAnalyticsSummary } from "@/lib/panel-analytics"

export type PanelTrendRow = {
  label: string
  current: string
  prior: string
  direction: "up" | "down" | "flat"
  note: string
}

/** Demo attribution-period trends derived from live panel snapshot. */
export function computePanelTrendRows(
  patients: Patient[],
  alerts: Alert[]
): PanelTrendRow[] {
  const summary = computePanelAnalyticsSummary(patients, alerts)
  const urgent = summary.urgent
  const rpm = summary.rpmEnrolled

  return [
    {
      label: "Urgent panel flags",
      current: String(urgent),
      prior: String(Math.max(0, urgent - 1)),
      direction: urgent > 0 ? "up" : "flat",
      note: "vs prior week snapshot",
    },
    {
      label: "A1c at goal",
      current: `${summary.a1cAtGoal}%`,
      prior: `${Math.max(0, summary.a1cAtGoal - 4)}%`,
      direction: summary.a1cAtGoal >= 50 ? "up" : "down",
      note: "attributed panel",
    },
    {
      label: "BP control",
      current: `${summary.bpControl}%`,
      prior: `${Math.max(0, summary.bpControl - 3)}%`,
      direction: summary.bpControl >= 70 ? "up" : "flat",
      note: "home + clinic",
    },
    {
      label: "RPM enrolled",
      current: String(rpm),
      prior: String(Math.max(0, rpm - 1)),
      direction: rpm > 0 ? "up" : "flat",
      note: "connected devices",
    },
  ]
}
