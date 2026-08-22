import type { Message } from "@/lib/types"

const STORAGE_KEY = "clinicianMessagesMock"

export function loadMockClinicianMessages(): Message[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Message[]
  } catch {
    return null
  }
}

export function saveMockClinicianMessages(messages: Message[]) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
}
