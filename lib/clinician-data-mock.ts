import { alerts as mockAlerts, doctorProfile as mockClinician } from "@/lib/mock-data"
import {
  getAiSummaries,
  getDemoPatients,
  getTimelineEvents,
} from "@/lib/resolve-demo-dates"
import {
  getPhysicianInbox,
  getSeedAppointments,
  getTodayAppointments,
} from "@/lib/doctor-dashboard-data"
import { toLocalDateIso } from "@/lib/calendar"
import type { ClinicianPlatformData } from "@/lib/clinician-data-repository"

export function loadMockClinicianPlatformData(): ClinicianPlatformData {
  const calendarAppointments = getSeedAppointments()
  const today = toLocalDateIso()
  return {
    source: "mock" as const,
    clinician: mockClinician,
    patients: getDemoPatients(),
    alerts: mockAlerts,
    inbox: getPhysicianInbox(),
    appointments: getTodayAppointments(),
    upcomingAppointments: calendarAppointments.filter(
      (appointment) => (appointment.appointmentDate ?? "") > today
    ),
    calendarAppointments,
    timelineEvents: getTimelineEvents(),
    aiSummaries: getAiSummaries(),
  }
}
