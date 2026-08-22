import { buildDoctorChartContext } from "@/lib/ai-context"
import { getPatientChartContextFromSupabase } from "@/lib/clinician-data-repository"
import { isSupabaseConfigured } from "@/lib/config/env"
import { alerts as mockAlerts } from "@/lib/mock-data"
import {
  getAiSummaries,
  getTimelineEvents,
} from "@/lib/resolve-demo-dates"
import type { Patient } from "@/lib/types"

/** Server-side chart context for pre-visit brief generation. */
export async function buildPreVisitChartContext(patient: Patient): Promise<string> {
  const patientId = patient.id
  let patientAlerts = mockAlerts.filter(
    (alert) => alert.patientId === patientId && alert.status === "active"
  )
  let timeline = getTimelineEvents()
    .filter((event) => event.patientId === patientId)
    .slice(0, 8)
  let summary = getAiSummaries()[patientId]

  if (isSupabaseConfigured()) {
    try {
      const live = await getPatientChartContextFromSupabase(patientId)
      patientAlerts = live.alerts
      timeline = live.timeline
      if (live.summary) summary = live.summary
    } catch {
      // Keep mock chart context if the live load fails.
    }
  }

  return buildDoctorChartContext(patient, {
    alerts: patientAlerts,
    timeline,
    summary,
  })
}
