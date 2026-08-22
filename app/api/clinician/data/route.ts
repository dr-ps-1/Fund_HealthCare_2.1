import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config/env"
import { loadMockClinicianPlatformData } from "@/lib/clinician-data-mock"
import { loadClinicianPlatformData } from "@/lib/clinician-data-repository"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ...loadMockClinicianPlatformData(),
      source: "mock" as const,
    })
  }

  try {
    const data = await loadClinicianPlatformData()
    return NextResponse.json(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load clinician data"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
