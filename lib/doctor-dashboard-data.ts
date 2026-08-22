import { alerts, getDemoPatients } from "@/lib/mock-data"
import {
  DEMO_SECONDARY_PATIENT_ID,
  DEMO_STAR_PATIENT_ID,
  DEMO_VITA_PATIENT_ID,
  isFullChartPatient,
} from "@/lib/demo-patients"
import {
  formatWeekdayShort,
  nextWeekdayIso,
  toLocalDateIso,
} from "@/lib/calendar"
import { computePanelTrendSignals } from "@/lib/panel-trend-signals"

export type TodayAppointment = {
  id: string
  time: string
  patientId: string
  patientName: string
  type: string
  reason: string
  location: string
  /** First visit of the day — highlight in schedule */
  isNext?: boolean
  /** Remote monitoring data available */
  rpmConnected?: boolean
  /** Home device summary for RPM-enrolled visits */
  rpmSummary?: string
  /** First-time visit — not yet on panel chart */
  isNewPatient?: boolean
  href: string
  appointmentDate?: string
  dateLabel?: string
}

export type InboxItem = {
  id: string
  kind: "lab" | "message" | "refill" | "referral" | "prior_auth"
  title: string
  patientId: string
  patientName: string
  priority: "high" | "medium"
  time: string
  href: string
}

export type PanelTrendSignal = {
  id: string
  text: string
  severity: "high" | "medium"
  href: string
}

const INBOX_PREVIEW_LIMIT = 4

function chartHref(patientId: string): string {
  if (patientId === "pending-new") return "/patients?search=James+Chen"
  if (isFullChartPatient(patientId)) return `/patients/${patientId}?brief=1`
  return `/patients/${patientId}`
}

function stampDate(
  appointmentDate: string,
  appointment: Omit<TodayAppointment, "appointmentDate" | "dateLabel">
): TodayAppointment {
  return {
    ...appointment,
    appointmentDate,
    dateLabel: formatWeekdayShort(appointmentDate),
    href: appointment.href || chartHref(appointment.patientId),
  }
}

function seedId(slot: string, date: string): string {
  return `appt-${slot}-${date}`
}

/** Seed visits for the clinician calendar (today + later this week). */
export function getSeedAppointments(): TodayAppointment[] {
  const today = toLocalDateIso()
  const monday = nextWeekdayIso(today, 1)
  const tuesday = nextWeekdayIso(today, 2)
  const thursday = nextWeekdayIso(today, 4)
  const friday = nextWeekdayIso(today, 5)
  const saturday = nextWeekdayIso(today, 6)
  const ava = getDemoPatients().find((p) => p.id === DEMO_STAR_PATIENT_ID)
  const sarah = getDemoPatients().find((p) => p.id === DEMO_SECONDARY_PATIENT_ID)

  return [
    stampDate(today, {
      id: seedId("1", today),
      time: "9:00 AM",
      patientId: DEMO_STAR_PATIENT_ID,
      patientName: ava?.name ?? "Ava Jackson",
      type: "Hypertension review",
      reason: "Hypertension review · review home BP before visit",
      location: "Exam 1 · In-person",
      isNext: true,
      rpmConnected: true,
      rpmSummary: "Home BP 152/88 · last device sync 6h ago",
      href: chartHref(DEMO_STAR_PATIENT_ID),
    }),
    stampDate(today, {
      id: seedId("2", today),
      time: "10:30 AM",
      patientId: DEMO_SECONDARY_PATIENT_ID,
      patientName: sarah?.name ?? "Sarah Johnson",
      type: "Chronic care",
      reason: "T2DM / HTN — overdue follow-up",
      location: "Exam 3 · In-person",
      href: chartHref(DEMO_SECONDARY_PATIENT_ID),
    }),
    stampDate(today, {
      id: seedId("3", today),
      time: "11:45 AM",
      patientId: "pending-new",
      patientName: "James Chen",
      type: "New patient",
      reason: "First visit · registration & panel attribution",
      location: "Exam 2 · In-person",
      isNewPatient: true,
      href: "/patients?search=James+Chen",
    }),
    stampDate(today, {
      id: seedId("4", today),
      time: "2:00 PM",
      patientId: "2",
      patientName: "Maria Garcia",
      type: "Heart failure",
      reason: "Volume status / med adherence",
      location: "Telehealth",
      href: chartHref("2"),
    }),
    stampDate(monday, {
      id: seedId("mon", monday),
      time: "10:00 AM",
      patientId: "5",
      patientName: "Michael Brown",
      type: "Diabetes follow-up",
      reason: "Neuropathy check · A1c trending at goal",
      location: "Exam 2 · In-person",
      href: chartHref("5"),
    }),
    stampDate(tuesday, {
      id: seedId("tue", tuesday),
      time: "11:15 AM",
      patientId: "3",
      patientName: "Robert Johnson",
      type: "COPD follow-up",
      reason: "Inhaler technique and SpO2 review",
      location: "Exam 1 · In-person",
      href: chartHref("3"),
    }),
    stampDate(thursday, {
      id: seedId("thu", thursday),
      time: "3:30 PM",
      patientId: "4",
      patientName: "Emily Chen",
      type: "Hypertension",
      reason: "Stage 2 HTN · med titration",
      location: "Telehealth",
      href: chartHref("4"),
    }),
    stampDate(friday, {
      id: seedId("fri", friday),
      time: "9:30 AM",
      patientId: "8",
      patientName: "Jennifer Martinez",
      type: "COPD follow-up",
      reason: "Post-exacerbation check · activity and SpO2",
      location: "Exam 2 · In-person",
      href: chartHref("8"),
    }),
    stampDate(saturday, {
      id: seedId("sat", saturday),
      time: "1:00 PM",
      patientId: DEMO_STAR_PATIENT_ID,
      patientName: ava?.name ?? "Ava Jackson",
      type: "RPM check-in",
      reason: "Review home BP trend and inhaler log",
      location: "Telehealth",
      rpmConnected: true,
      rpmSummary: "Connected cuff · daily check-ins",
      href: chartHref(DEMO_STAR_PATIENT_ID),
    }),
  ]
}

export function getTodayAppointments(): TodayAppointment[] {
  const today = toLocalDateIso()
  return getSeedAppointments()
    .filter((appointment) => appointment.appointmentDate === today)
    .map((appointment, index) => ({
      ...appointment,
      isNext: index === 0,
    }))
}

/** Full physician inbox — sorted by priority, one urgent item per patient where possible. */
export function getPhysicianInbox(): InboxItem[] {
  const items: InboxItem[] = [
    {
      id: "inbox-4",
      kind: "lab",
      title: "Home monitoring summary — BP trend available",
      patientId: DEMO_VITA_PATIENT_ID,
      patientName: "Ava Jackson",
      priority: "high",
      time: "6 hours ago",
      href: `/patients/${DEMO_VITA_PATIENT_ID}`,
    },
    {
      id: "inbox-2",
      kind: "prior_auth",
      title: "Metformin prior auth — pending payer review",
      patientId: DEMO_SECONDARY_PATIENT_ID,
      patientName: "Sarah Johnson",
      priority: "medium",
      time: "Yesterday",
      href: `/patients/${DEMO_SECONDARY_PATIENT_ID}`,
    },
    {
      id: "inbox-5",
      kind: "refill",
      title: "Furosemide refill request",
      patientId: "2",
      patientName: "Maria Garcia",
      priority: "medium",
      time: "Yesterday",
      href: "/patients/2",
    },
    {
      id: "inbox-6",
      kind: "referral",
      title: "Cardiology referral — status update",
      patientId: "8",
      patientName: "David Kim",
      priority: "medium",
      time: "2 days ago",
      href: "/patients/8",
    },
  ]

  return items.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === "high" ? -1 : 1
    }
    return 0
  })
}

export function getPhysicianInboxPreview(limit = INBOX_PREVIEW_LIMIT): InboxItem[] {
  return getPhysicianInbox().slice(0, limit)
}

export function getPhysicianInboxUrgentCount(): number {
  return getPhysicianInbox().filter((i) => i.priority === "high").length
}

export function getPhysicianInboxTotalCount(): number {
  return getPhysicianInbox().length
}

/** Cohort-level trends — computed from panel patients and active alerts. */
export function getPanelTrendSignals(): PanelTrendSignal[] {
  return computePanelTrendSignals(getDemoPatients(), alerts)
}

export function getGreetingName(): string {
  return "Dr. Sarah Wilson"
}
