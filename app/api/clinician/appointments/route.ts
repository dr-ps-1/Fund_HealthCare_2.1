import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config/env"
import { createAppointmentInSupabase } from "@/lib/clinician-data-repository"

type PostBody = {
  patientId?: string
  patientName?: string
  appointmentDate?: string
  appointmentTime?: string
  visitType?: "in-person" | "telehealth" | "follow-up"
  reason?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PostBody
  const patientId = body.patientId?.trim()
  const patientName = body.patientName?.trim()
  const appointmentDate = body.appointmentDate?.trim()
  const appointmentTime = body.appointmentTime?.trim()
  const visitType = body.visitType

  if (!patientId || !patientName || !appointmentDate || !appointmentTime) {
    return NextResponse.json(
      {
        error:
          "patientId, patientName, appointmentDate, and appointmentTime required",
      },
      { status: 400 }
    )
  }

  if (
    visitType !== "in-person" &&
    visitType !== "telehealth" &&
    visitType !== "follow-up"
  ) {
    return NextResponse.json({ error: "Invalid visitType" }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    )
  }

  try {
    const appointment = await createAppointmentInSupabase({
      patientId,
      patientName,
      appointmentDate,
      appointmentTime24: appointmentTime,
      visitType,
      reason: body.reason,
    })
    return NextResponse.json({ appointment, source: "supabase" as const })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create appointment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
