const STORAGE_KEY = "clinicalAssistantThreads"

export type StoredAssistantMessage = {
  id: string
  content: string
  isFromAI: boolean
  time: string
}

function readAll(): Record<string, StoredAssistantMessage[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, StoredAssistantMessage[]>
  } catch {
    return {}
  }
}

function writeAll(threads: Record<string, StoredAssistantMessage[]>) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
}

export function loadAssistantThread(
  patientId: string
): StoredAssistantMessage[] {
  return readAll()[patientId] ?? []
}

export function saveAssistantThread(
  patientId: string,
  messages: StoredAssistantMessage[]
) {
  const all = readAll()
  all[patientId] = messages
  writeAll(all)
}
