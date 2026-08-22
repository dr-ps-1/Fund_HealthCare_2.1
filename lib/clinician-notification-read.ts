const STORAGE_KEY = "clinicianNotificationsRead"

export function loadReadNotificationIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function saveReadNotificationIds(ids: Set<string>) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function markNotificationRead(id: string) {
  const ids = loadReadNotificationIds()
  ids.add(id)
  saveReadNotificationIds(ids)
}

export function markAllNotificationsRead(ids: string[]) {
  const current = loadReadNotificationIds()
  for (const id of ids) current.add(id)
  saveReadNotificationIds(current)
}
