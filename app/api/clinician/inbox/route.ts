import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config/env"
import { completeInboxTaskInSupabase } from "@/lib/clinician-data-repository"

type PatchBody = {
  taskId?: string
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PatchBody
  const taskId = body.taskId?.trim()

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, source: "mock" as const })
  }

  try {
    await completeInboxTaskInSupabase(taskId)
    return NextResponse.json({ ok: true, source: "supabase" as const })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to complete inbox task"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
