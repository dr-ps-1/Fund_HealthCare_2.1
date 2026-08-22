import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config/env"
import {
  listClinicianMessagesFromSupabase,
  sendClinicianMessageToSupabase,
} from "@/lib/clinician-messages-repository"
import { messages as mockMessages } from "@/lib/mock-data"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      source: "mock" as const,
      messages: mockMessages,
      readPatientIds: [] as string[],
    })
  }

  try {
    const payload = await listClinicianMessagesFromSupabase()
    return NextResponse.json({
      source: "supabase" as const,
      ...payload,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load messages"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type PostBody = {
  patientId?: string
  content?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PostBody
  const patientId = body.patientId?.trim()
  const content = body.content?.trim()

  if (!patientId || !content) {
    return NextResponse.json(
      { error: "patientId and content are required" },
      { status: 400 }
    )
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server" },
      { status: 503 }
    )
  }

  try {
    const message = await sendClinicianMessageToSupabase(patientId, content)
    return NextResponse.json({ message })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send message"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
