import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config/env"
import { doctorProfile as mockProfile } from "@/lib/mock-data"
import {
  loadClinicianPlatformData,
  updateClinicianProfileInSupabase,
} from "@/lib/clinician-data-repository"
import type { DoctorProfile } from "@/lib/types"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ profile: mockProfile, source: "mock" as const })
  }

  try {
    const data = await loadClinicianPlatformData()
    return NextResponse.json({ profile: data.clinician, source: "supabase" as const })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<DoctorProfile>

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      profile: { ...mockProfile, ...body },
      source: "mock" as const,
    })
  }

  try {
    const profile = await updateClinicianProfileInSupabase(body)
    return NextResponse.json({ profile, source: "supabase" as const })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
