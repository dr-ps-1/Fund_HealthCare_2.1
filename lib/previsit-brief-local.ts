import type { StoredPreVisitBrief } from "@/lib/previsit-brief"

const KEY_PREFIX = "previsitBrief:"

export function loadStoredPreVisitBrief(
  patientId: string
): StoredPreVisitBrief | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(`${KEY_PREFIX}${patientId}`)
    if (!raw) return null
    return JSON.parse(raw) as StoredPreVisitBrief
  } catch {
    return null
  }
}

export function saveStoredPreVisitBrief(
  patientId: string,
  stored: StoredPreVisitBrief
) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(`${KEY_PREFIX}${patientId}`, JSON.stringify(stored))
}
