import { DEMO_STAR_PATIENT_ID, DEMO_VITA_PATIENT_ID } from "@/lib/demo-patients"
import { messages as defaultMessages, getDemoPatients } from "@/lib/mock-data"
import type { Message, Patient } from "@/lib/types"

export type MessageThread = {
  patientId: string
  patientName: string
  patientPhoto: string
  condition: string
  keyMetric: string
  status: "red" | "yellow" | "green"
  lastMessage: string
  lastTime: string
  needsReply: boolean
  read: boolean
  href: string
  rpm: boolean
}

const READ_THREADS_STORAGE_KEY = "clinicianReadMessageThreads"

/** Patient acknowledgments that do not require a clinical reply. */
export function isActionablePatientMessage(content: string): boolean {
  const normalized = content.trim().toLowerCase()
  const nonActionable = [
    /^thank(s| you)/,
    /^ok[,!.\s]/,
    /^okay[,!.\s]/,
    /^got it/,
    /^sounds good/,
    /^will do/,
  ]
  return !nonActionable.some((pattern) => pattern.test(normalized))
}

export function getReadMessageThreadIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = sessionStorage.getItem(READ_THREADS_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

export function markMessageThreadRead(patientId: string) {
  if (typeof window === "undefined") return
  const ids = getReadMessageThreadIds()
  if (ids.has(patientId)) return
  ids.add(patientId)
  sessionStorage.setItem(READ_THREADS_STORAGE_KEY, JSON.stringify([...ids]))
}

export function markAllMessageThreadsRead(patientIds: string[]) {
  if (typeof window === "undefined") return
  const ids = getReadMessageThreadIds()
  for (const id of patientIds) ids.add(id)
  sessionStorage.setItem(READ_THREADS_STORAGE_KEY, JSON.stringify([...ids]))
}

export function buildMessageThreads(
  messageSource: Message[] = defaultMessages,
  readIds?: Set<string> | string[],
  patients?: Patient[]
): MessageThread[] {
  const read =
    readIds instanceof Set
      ? readIds
      : Array.isArray(readIds)
        ? new Set(readIds)
        : getReadMessageThreadIds()
  const panel = patients ?? getDemoPatients()
  const patientIds = [...new Set(messageSource.map((m) => m.patientId))]

  return patientIds
    .map((patientId) => {
      const patient = panel.find((p) => p.id === patientId)
      const threadMessages = messageSource.filter((m) => m.patientId === patientId)
      const lastMsg = threadMessages[threadMessages.length - 1]
      if (!lastMsg || !patient) return null

      const needsReply =
        !lastMsg.isFromDoctor && isActionablePatientMessage(lastMsg.content)

      return {
        patientId,
        patientName: patient.name,
        patientPhoto: patient.photo,
        condition: patient.condition,
        keyMetric: patient.keyMetric,
        status: patient.status,
        lastMessage: lastMsg.content,
        lastTime: lastMsg.time,
        needsReply,
        read: read.has(patientId) || !needsReply,
        href: `/messages?patient=${patientId}`,
        rpm: patientId === DEMO_VITA_PATIENT_ID,
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a!.patientId === DEMO_STAR_PATIENT_ID) return -1
      if (b!.patientId === DEMO_STAR_PATIENT_ID) return 1
      if (a!.read !== b!.read) return a!.read ? 1 : -1
      const order = { red: 0, yellow: 1, green: 2 }
      return order[a!.status] - order[b!.status]
    }) as MessageThread[]
}

export function getUnreadMessageThreadCount(
  readIds?: Set<string> | string[],
  messageSource?: Message[],
  patients?: Patient[]
): number {
  return buildMessageThreads(
    messageSource ?? defaultMessages,
    readIds,
    patients
  ).filter((t) => !t.read && t.needsReply).length
}

export function getThreadsNeedingReply(
  readIds?: Set<string> | string[],
  messageSource?: Message[],
  patients?: Patient[]
): MessageThread[] {
  return buildMessageThreads(
    messageSource ?? defaultMessages,
    readIds,
    patients
  ).filter((t) => t.needsReply && !t.read)
}

export function getThreadMessages(
  patientId: string,
  messageSource: Message[] = defaultMessages
): Message[] {
  return messageSource.filter((m) => m.patientId === patientId)
}

export function getLatestPatientMessage(
  patientId: string,
  messageSource: Message[] = defaultMessages
): Message | undefined {
  const patientMessages = messageSource.filter(
    (m) => m.patientId === patientId && !m.isFromDoctor
  )
  return patientMessages[patientMessages.length - 1]
}
