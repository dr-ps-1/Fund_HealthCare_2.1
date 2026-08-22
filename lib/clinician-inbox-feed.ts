import type { InboxItem } from "@/lib/doctor-dashboard-data"
import { DEMO_STAR_PATIENT_ID } from "@/lib/demo-patients"

/** Tasks shown on the doctor home card (not messages). */
export const HOME_INBOX_PREVIEW_LIMIT = 3

/** Inbox task IDs duplicated in clinical priorities — hide from task lists. */
export const INBOX_IDS_COVERED_BY_PRIORITIES = new Set(["inbox-1"])

/**
 * Home "Tasks due today" — actionable tasks only, deduped with clinical priorities.
 */
export function getHomeInboxPreview(inbox: InboxItem[]): InboxItem[] {
  return inbox
    .filter((item) => !INBOX_IDS_COVERED_BY_PRIORITIES.has(item.id))
    .slice(0, HOME_INBOX_PREVIEW_LIMIT)
}

export function filterInboxForWorkqueue(inbox: InboxItem[]): InboxItem[] {
  return inbox.filter((item) => !INBOX_IDS_COVERED_BY_PRIORITIES.has(item.id))
}

/** Skip the demo-star urgent flag in the bell when she is already in clinical priorities. */
export function shouldShowUrgentPanelFlagInBell(
  alerts: { patientId: string; status: string; severity: string }[]
): boolean {
  const starUrgent = alerts.some(
    (a) =>
      a.patientId === DEMO_STAR_PATIENT_ID &&
      a.status === "active" &&
      a.severity === "high"
  )
  return !starUrgent
}
