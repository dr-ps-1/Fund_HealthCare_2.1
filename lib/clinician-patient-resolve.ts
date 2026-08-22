import "server-only"

import { isSupabaseConfigured } from "@/lib/config/env"
import { getPanelPatientFromSupabase } from "@/lib/clinician-data-repository"
import { getDemoPatients } from "@/lib/mock-data"
import type { Patient } from "@/lib/types"

export async function resolveClinicianPanelPatient(
  patientId: string
): Promise<Patient | null> {
  if (isSupabaseConfigured()) {
    try {
      const patient = await getPanelPatientFromSupabase(patientId)
      if (patient) return patient
    } catch {
      // Use mock panel if Supabase is unavailable.
    }
  }

  return getDemoPatients().find((patient) => patient.id === patientId) ?? null
}
