import type { PanelStatusLabel, PatientStatus } from "./types"

export function panelStatusLabel(status: PatientStatus): PanelStatusLabel {
  if (status === "red") return "Urgent"
  if (status === "yellow") return "Attention"
  return "OK"
}
