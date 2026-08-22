import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config/env"
import {
  listChartNotesFromSupabase,
  saveChartNoteInSupabase,
} from "@/lib/clinician-data-repository"

export async function GET(request: Request) {
  const patientId = new URL(request.url).searchParams.get("patientId")?.trim()

  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ notes: [], source: "mock" as const })
  }

  try {
    const notes = await listChartNotesFromSupabase(patientId)
    return NextResponse.json({ notes, source: "supabase" as const })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load chart notes"
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
      { error: "patientId and content required" },
      { status: 400 }
    )
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    )
  }

  try {
    const note = await saveChartNoteInSupabase(patientId, content)
    return NextResponse.json({ note, source: "supabase" as const })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save chart note"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
