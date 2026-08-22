import { saveLocalChartNote } from "@/lib/chart-notes-local"
import { saveClinicianChartNote } from "@/lib/clinician-data-api"
import { isSupabaseMessagingEnabled } from "@/lib/config/public-env"

export const CHART_NOTES_UPDATED_EVENT = "clinician-chart-notes-updated"

export async function saveChartNoteAction(
  patientId: string,
  content: string
): Promise<void> {
  if (isSupabaseMessagingEnabled()) {
    await saveClinicianChartNote(patientId, content)
  } else {
    saveLocalChartNote(patientId, content)
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CHART_NOTES_UPDATED_EVENT, { detail: { patientId } })
    )
  }
}
