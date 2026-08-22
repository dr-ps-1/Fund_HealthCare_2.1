const US_LOCALE = "en-US"
export const DEMO_AS_OF_KEY = "demoAsOf"

/** Session-pinned clock at clinician login; otherwise wall clock. */
export function demoNow(): Date {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(DEMO_AS_OF_KEY)
    if (stored) {
      const parsed = new Date(stored)
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
  }
  return new Date()
}

export function pinDemoClock(now: Date = new Date()) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(DEMO_AS_OF_KEY, now.toISOString())
}

export function clearDemoClock() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(DEMO_AS_OF_KEY)
}

/** Pinned demo anchor when role was selected; null if using wall clock. */
export function getPinnedDemoDate(): Date | null {
  if (typeof window === "undefined") return null
  const stored = sessionStorage.getItem(DEMO_AS_OF_KEY)
  if (!stored) return null
  const parsed = new Date(stored)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Advance pinned demo anchor to today when the calendar day rolls over. */
export function ensureDemoClockForToday(wallNow: Date = new Date()): void {
  if (typeof window === "undefined") return
  const pinned = getPinnedDemoDate()
  if (!pinned) return
  const todayStart = startOfLocalDay(wallNow)
  const pinnedStart = startOfLocalDay(pinned)
  if (pinnedStart.getTime() < todayStart.getTime()) {
    pinDemoClock(todayStart)
  }
}

export function getTimeGreeting(now: Date = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function startOfLocalDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function daysAgoFrom(now: Date, days: number): Date {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d
}

export function daysFromNowFrom(now: Date, days: number): Date {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return d
}

export function hoursAgoFrom(now: Date, hours: number): Date {
  return new Date(now.getTime() - hours * 60 * 60 * 1000)
}

export type DateOffset = {
  daysAgo?: number
  hoursAgo?: number
  hour?: number
  minute?: number
}

/** Resolve a demo event timestamp from offsets relative to `now`. */
export function dateFromOffset(now: Date, offset: DateOffset): string {
  if (offset.daysAgo !== undefined) {
    const d = daysAgoFrom(now, offset.daysAgo)
    if (offset.hour !== undefined) {
      d.setHours(offset.hour, offset.minute ?? 0, 0, 0)
    }
    return d.toISOString()
  }
  if (offset.hoursAgo !== undefined) {
    return hoursAgoFrom(now, offset.hoursAgo).toISOString()
  }
  return now.toISOString()
}

export function formatUsDate(value: string | Date, now?: Date): string {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleDateString(US_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatUsDateTime(value: string | Date): string {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleString(US_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatUsDateLong(now: Date = demoNow()): string {
  return formatUsDate(now)
}

export function formatDaysAgoLabel(days: number): string {
  if (days === 0) return "Today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export function formatUsDateNumeric(value: string | Date): string {
  const parsed = value instanceof Date ? value : new Date(value.includes("T") ? value : `${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value
    return String(value)
  }
  return parsed.toLocaleDateString(US_LOCALE, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
}

export function usTimezoneLabel(state?: string): string {
  switch (state) {
    case "CA":
      return "PT"
    case "FL":
    case "NY":
      return "ET"
    default:
      return "local"
  }
}

export function toDateOnlyIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}
