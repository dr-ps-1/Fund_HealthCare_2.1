import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config/env"
import { acknowledgeAlertInSupabase } from "@/lib/clinician-data-repository"

type PatchBody = {
  alertId?: string
  status?: "resolved" | "active"
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PatchBody
  const alertId = body.alertId?.trim()

  if (!alertId) {
    return NextResponse.json({ error: "alertId required" }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, source: "mock" as const })
  }

  if (body.status !== "resolved") {
    return NextResponse.json(
      { error: "Only status=resolved is supported" },
      { status: 400 }
    )
  }

  try {
    await acknowledgeAlertInSupabase(alertId)
    return NextResponse.json({ ok: true, source: "supabase" as const })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update alert"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
