import { DEMO_VITA_PATIENT_ID } from "@/lib/demo-patients"
import { getSeedAppointments, type TodayAppointment } from "@/lib/doctor-dashboard-data"
import {
  parseDisplayTime,
  toLocalDateIso,
} from "@/lib/calendar"

const STORAGE_KEY = "clinicianLocalAppointments"
const CANCELLED_KEY = "clinicianCancelledAppointments"

export type LocalAppointmentInput = {
  patientId: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  visitType: "in-person" | "telehealth" | "follow-up"
  reason?: string
}

type StoredAppointment = LocalAppointmentInput & {
  id: string
  createdAt: string
}

function readStored(): StoredAppointment[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredAppointment[]
  } catch {
    return []
  }
}

function writeStored(rows: StoredAppointment[]) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

function readCancelled(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = sessionStorage.getItem(CANCELLED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeCancelled(ids: Set<string>) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(CANCELLED_KEY, JSON.stringify([...ids]))
}

function formatDisplayTime(time24: string): string {
  const [hourPart, minutePart] = time24.split(":")
  const hour = Number.parseInt(hourPart ?? "9", 10)
  const minute = Number.parseInt(minutePart ?? "0", 10)
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function visitLabel(visitType: LocalAppointmentInput["visitType"]): string {
  switch (visitType) {
    case "telehealth":
      return "Telehealth"
    case "follow-up":
      return "Follow-up"
    default:
      return "In-person visit"
  }
}

function locationFor(visitType: LocalAppointmentInput["visitType"]): string {
  switch (visitType) {
    case "telehealth":
      return "Telehealth"
    case "follow-up":
      return "Clinic · Follow-up"
    default:
      return "Exam 4 · In-person"
  }
}

function toTodayAppointment(row: StoredAppointment): TodayAppointment {
  const rpmConnected = row.patientId === DEMO_VITA_PATIENT_ID
  const isToday = row.appointmentDate === todayIso()
  return {
    id: row.id,
    time: formatDisplayTime(row.appointmentTime),
    patientId: row.patientId,
    patientName: row.patientName,
    type: visitLabel(row.visitType),
    reason: row.reason?.trim() || "Scheduled from chart",
    location: locationFor(row.visitType),
    rpmConnected,
    rpmSummary: rpmConnected ? "RPM enrolled · review home readings" : undefined,
    href: `/patients/${row.patientId}?brief=1${isToday ? "&schedule=1" : ""}`,
    appointmentDate: row.appointmentDate,
    dateLabel: formatDateLabel(row.appointmentDate),
  }
}

function formatDateLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function todayIso(): string {
  return toLocalDateIso()
}

function sortByTime(a: TodayAppointment, b: TodayAppointment): number {
  return parseDisplayTime(a.time) - parseDisplayTime(b.time)
}

function sortByDateThenTime(a: TodayAppointment, b: TodayAppointment): number {
  const dateCompare = (a.appointmentDate ?? "").localeCompare(
    b.appointmentDate ?? ""
  )
  if (dateCompare !== 0) return dateCompare
  return sortByTime(a, b)
}

export function getLocalAppointmentsForToday(): TodayAppointment[] {
  return readStored()
    .filter((row) => row.appointmentDate === todayIso())
    .map(toTodayAppointment)
    .sort(sortByTime)
}

export function saveLocalAppointment(
  input: LocalAppointmentInput
): TodayAppointment {
  return upsertLocalAppointment(`local-appt-${Date.now()}`, input)
}

export function updateLocalAppointment(
  id: string,
  input: LocalAppointmentInput
): TodayAppointment {
  const cancelled = readCancelled()
  cancelled.delete(id)
  writeCancelled(cancelled)
  return upsertLocalAppointment(id, input)
}

export function cancelLocalAppointment(id: string) {
  writeStored(readStored().filter((row) => row.id !== id))
  const cancelled = readCancelled()
  cancelled.add(id)
  writeCancelled(cancelled)
}

function upsertLocalAppointment(
  id: string,
  input: LocalAppointmentInput
): TodayAppointment {
  const existing = readStored().find((row) => row.id === id)
  const row: StoredAppointment = {
    ...input,
    id,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }
  writeStored([row, ...readStored().filter((item) => item.id !== id)])
  return toTodayAppointment(row)
}

export function findTimeConflict(
  appointmentDate: string,
  appointmentTime: string,
  excludeId?: string
): TodayAppointment | null {
  const target = parseDisplayTime(formatDisplayTime(appointmentTime))
  return (
    getAllCalendarAppointments().find(
      (appointment) =>
        appointment.appointmentDate === appointmentDate &&
        appointment.id !== excludeId &&
        parseDisplayTime(appointment.time) === target
    ) ?? null
  )
}

export function getLocalUpcomingAppointments(): TodayAppointment[] {
  const today = todayIso()
  return getAllCalendarAppointments().filter(
    (appt) => (appt.appointmentDate ?? "") > today
  )
}

export function getMockTodayAppointments(): TodayAppointment[] {
  const today = todayIso()
  return getAllCalendarAppointments()
    .filter((appt) => appt.appointmentDate === today)
    .sort(sortByTime)
}

export function getAllCalendarAppointments(): TodayAppointment[] {
  const cancelled = readCancelled()
  const local = readStored()
    .filter((row) => !cancelled.has(row.id))
    .map(toTodayAppointment)
  const localIds = new Set(local.map((appointment) => appointment.id))
  const seed = getSeedAppointments().filter(
    (appointment) =>
      !cancelled.has(appointment.id) && !localIds.has(appointment.id)
  )
  return mergeAppointmentLists(local, seed)
}

export function getMockUpcomingAppointments(): TodayAppointment[] {
  const today = todayIso()
  return getAllCalendarAppointments().filter(
    (appt) => (appt.appointmentDate ?? "") > today
  )
}

export function mergeAppointmentLists(
  ...lists: TodayAppointment[][]
): TodayAppointment[] {
  const seen = new Set<string>()
  return lists
    .flat()
    .filter((appt) => {
      if (seen.has(appt.id)) return false
      seen.add(appt.id)
      return true
    })
    .sort(sortByDateThenTime)
}

export function withLocalAppointments(input: {
  appointments: TodayAppointment[]
  upcomingAppointments: TodayAppointment[]
  calendarAppointments: TodayAppointment[]
}): {
  appointments: TodayAppointment[]
  upcomingAppointments: TodayAppointment[]
  calendarAppointments: TodayAppointment[]
} {
  const cancelled = readCancelled()
  const withoutCancelled = (list: TodayAppointment[]) =>
    list.filter((appointment) => !cancelled.has(appointment.id))

  return {
    appointments: mergeAppointmentLists(
      getMockTodayAppointments(),
      withoutCancelled(input.appointments)
    ),
    upcomingAppointments: mergeAppointmentLists(
      getMockUpcomingAppointments(),
      withoutCancelled(input.upcomingAppointments)
    ),
    calendarAppointments: mergeAppointmentLists(
      getAllCalendarAppointments(),
      withoutCancelled(input.calendarAppointments)
    ),
  }
}
