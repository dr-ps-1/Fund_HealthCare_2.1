import { messages as defaultMessages } from "@/lib/mock-data"
import {
  getPhysicianInbox,
  type InboxItem,
} from "@/lib/doctor-dashboard-data"
import {
  getHomeInboxPreview,
  shouldShowUrgentPanelFlagInBell,
} from "@/lib/clinician-inbox-feed"
import {
  buildMessageThreads,
  type MessageThread,
} from "@/lib/clinician-messages"
import { getAttributionPeriodLabel } from "@/lib/panel-analytics"
import {
  DEFAULT_CLINICIAN_NOTIFICATION_PREFERENCES,
  type ClinicianNotificationPreferences,
} from "@/lib/clinician-notification-preferences"
import type { Alert, Message, Patient } from "@/lib/types"

export type ClinicianNotificationCategory =
  | "urgent"
  | "inbox"
  | "message"
  | "system"

export type ClinicianNotification = {
  id: string
  category: ClinicianNotificationCategory
  title: string
  description: string
  time: string
  href: string
  read: boolean
}

const DEFAULT_READ_IDS = new Set(["cn-system-report"])

type NotificationInput = {
  alerts?: Alert[]
  inbox?: InboxItem[]
  messages?: Message[]
  patients?: Patient[]
  readPatientIds?: string[]
  /** Inbox task IDs already visible on the home card — omit from bell */
  excludeInboxIds?: string[]
  preferences?: ClinicianNotificationPreferences
}

function messageNotificationFromThread(thread: MessageThread): ClinicianNotification {
  return {
    id: `cn-message-${thread.patientId}`,
    category: "message",
    title: thread.rpm ? "Patient message · RPM" : "Patient message",
    description: `${thread.patientName}: ${thread.lastMessage}`,
    time: thread.lastTime,
    href: thread.href,
    read: false,
  }
}

/** Bell = new items not already on home (messages, lower-priority tasks, system). */
export function getClinicianNotifications(
  input: NotificationInput = {}
): ClinicianNotification[] {
  const alerts = input.alerts ?? []
  const inbox = input.inbox ?? getPhysicianInbox()
  const messages = input.messages ?? defaultMessages
  const readPatientIds = input.readPatientIds ?? []
  const preferences =
    input.preferences ?? DEFAULT_CLINICIAN_NOTIFICATION_PREFERENCES
  const homePreviewIds = new Set(
    input.excludeInboxIds ?? getHomeInboxPreview(inbox).map((item) => item.id)
  )

  const items: ClinicianNotification[] = []

  if (shouldShowUrgentPanelFlagInBell(alerts)) {
    const urgent = alerts.find(
      (a) => a.status === "active" && a.severity === "high"
    )
    if (urgent) {
      items.push({
        id: `cn-urgent-${urgent.id}`,
        category: "urgent",
        title: "Urgent panel flag",
        description: `${urgent.patientName}: ${urgent.headline}`,
        time: urgent.time,
        href: `/patients/${urgent.patientId}?brief=1`,
        read: false,
      })
    }
  }

  for (const item of inbox) {
    if (homePreviewIds.has(item.id)) continue
    items.push({
      id: `cn-inbox-${item.id}`,
      category: "inbox",
      title: item.title,
      description: `${item.patientName} · Task`,
      time: item.time,
      href: item.href,
      read: false,
    })
  }

  const messageThreads = buildMessageThreads(
    messages,
    readPatientIds,
    input.patients
  ).filter((thread) => thread.needsReply && !thread.read)

  for (const thread of messageThreads) {
    items.push(messageNotificationFromThread(thread))
  }

  const attributionPeriod = getAttributionPeriodLabel()

  items.push({
    id: "cn-system-report",
    category: "system",
    title: "Population snapshot ready",
    description: `${attributionPeriod} panel quality and risk summary available`,
    time: "2 hours ago",
    href: "/analytics",
    read: true,
  })

  return items
    .filter((item) => {
      switch (item.category) {
        case "urgent":
          return preferences.urgentAlerts
        case "inbox":
          return preferences.inboxTasks
        case "message":
          return preferences.patientMessages
        case "system":
          return preferences.systemUpdates
      }
    })
    .map((item) => ({
      ...item,
      read: item.read || DEFAULT_READ_IDS.has(item.id),
    }))
}

export function getClinicianNotificationUnreadCount(
  notifications: ClinicianNotification[]
): number {
  return notifications.filter((n) => !n.read).length
}
