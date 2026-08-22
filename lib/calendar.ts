/** Local calendar-date helpers for the clinician schedule (not UTC). */

export function toLocalDateIso(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseLocalDateIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function addDaysToIso(iso: string, days: number): string {
  const date = parseLocalDateIso(iso)
  date.setDate(date.getDate() + days)
  return toLocalDateIso(date)
}

/** Next occurrence of a weekday (0 = Sunday … 6 = Saturday), not including today. */
export function nextWeekdayIso(fromIso: string, weekday: number): string {
  const from = parseLocalDateIso(fromIso)
  let delta = weekday - from.getDay()
  if (delta <= 0) delta += 7
  return addDaysToIso(fromIso, delta)
}

export function startOfWeekSunday(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - start.getDay())
  return start
}

export function weekDateIsos(anchorIso: string): string[] {
  const start = startOfWeekSunday(parseLocalDateIso(anchorIso))
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return toLocalDateIso(day)
  })
}

export function formatWeekdayShort(iso: string): string {
  return parseLocalDateIso(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function formatWeekRangeLabel(anchorIso: string): string {
  const days = weekDateIsos(anchorIso)
  const start = parseLocalDateIso(days[0] ?? anchorIso)
  const end = parseLocalDateIso(days[6] ?? anchorIso)
  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${startLabel} – ${endLabel}`
}

export function formatDayHeading(iso: string): string {
  return parseLocalDateIso(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

/** Minutes from midnight for display times like "9:00 AM" or "09:00". */
export function parseDisplayTime(label: string): number {
  const trimmed = label.trim()
  const match24 = /^(\d{1,2}):(\d{2})$/.exec(trimmed)
  if (match24) {
    return Number(match24[1]) * 60 + Number(match24[2])
  }
  const parsed = Date.parse(`1970-01-01 ${trimmed}`)
  if (Number.isNaN(parsed)) return 0
  const date = new Date(parsed)
  return date.getHours() * 60 + date.getMinutes()
}

/** Convert "9:00 AM" / "14:30" to an <input type="time"> value. */
export function displayTimeToInput(label: string): string {
  const minutes = parseDisplayTime(label)
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function formatTimeNow(now: Date = new Date()): string {
  return now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export type CalendarVisitKind = "in-person" | "telehealth" | "rpm"

export function appointmentVisitKind(
  appointment: {
    type: string
    location: string
    rpmConnected?: boolean
  }
): CalendarVisitKind {
  if (appointment.rpmConnected) return "rpm"
  const text = `${appointment.type} ${appointment.location}`.toLowerCase()
  if (text.includes("telehealth")) return "telehealth"
  return "in-person"
}

export function overlappingAppointmentIds(
  appointments: { id: string; time: string }[]
): Set<string> {
  const byTime = new Map<number, string[]>()
  for (const appointment of appointments) {
    const key = parseDisplayTime(appointment.time)
    const list = byTime.get(key) ?? []
    list.push(appointment.id)
    byTime.set(key, list)
  }
  const ids = new Set<string>()
  for (const group of byTime.values()) {
    if (group.length > 1) {
      for (const id of group) ids.add(id)
    }
  }
  return ids
}
