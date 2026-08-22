import type { Message } from "@/lib/types"

export type MessagesApiResponse = {
  source: "mock" | "supabase"
  messages: Message[]
  readPatientIds: string[]
}

export async function fetchClinicianMessages(): Promise<MessagesApiResponse> {
  const response = await fetch("/api/messages", { cache: "no-store" })
  const payload = (await response.json()) as MessagesApiResponse & {
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load messages")
  }

  return payload
}

export async function sendClinicianMessage(
  patientId: string,
  content: string
): Promise<Message> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId, content }),
  })

  const payload = (await response.json()) as { message?: Message; error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to send message")
  }

  if (!payload.message) {
    throw new Error("Message payload missing from API response")
  }

  return payload.message
}

export async function markClinicianThreadReadApi(
  patientId: string
): Promise<void> {
  await fetch("/api/messages/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId }),
  })
}

export async function markAllClinicianThreadsReadApi(
  patientIds: string[]
): Promise<void> {
  await fetch("/api/messages/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientIds }),
  })
}
