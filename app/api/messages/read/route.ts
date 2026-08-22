import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config/env"
import {
  markAllClinicianThreadsReadInSupabase,
  markClinicianThreadReadInSupabase,
} from "@/lib/clinician-messages-repository"

type PostBody = {
  patientId?: string
  patientIds?: string[]
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PostBody

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, source: "mock" as const })
  }

  try {
    if (body.patientIds?.length) {
      await markAllClinicianThreadsReadInSupabase(body.patientIds)
      return NextResponse.json({ ok: true, source: "supabase" as const })
    }

    const patientId = body.patientId?.trim()
    if (!patientId) {
      return NextResponse.json(
        { error: "patientId or patientIds required" },
        { status: 400 }
      )
    }

    await markClinicianThreadReadInSupabase(patientId)
    return NextResponse.json({ ok: true, source: "supabase" as const })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update read state"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
