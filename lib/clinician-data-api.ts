import type { ClinicianPlatformData } from "@/lib/clinician-data-repository"
import type { DoctorProfile } from "@/lib/types"

export type ClinicianDataResponse = ClinicianPlatformData & {
  source: "mock" | "supabase"
}

export async function fetchClinicianPlatformData(): Promise<ClinicianDataResponse> {
  const response = await fetch("/api/clinician/data", { cache: "no-store" })
  const payload = (await response.json()) as ClinicianDataResponse & {
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load clinician data")
  }

  return payload
}

export async function acknowledgeClinicianAlert(alertId: string): Promise<void> {
  const response = await fetch("/api/clinician/alerts", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alertId, status: "resolved" }),
  })

  const payload = (await response.json()) as { error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to acknowledge alert")
  }
}

export async function completeClinicianInboxTask(taskId: string): Promise<void> {
  const response = await fetch("/api/clinician/inbox", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId }),
  })

  const payload = (await response.json()) as { error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to complete inbox task")
  }
}

export async function saveClinicianChartNote(
  patientId: string,
  content: string
): Promise<{ id: string; content: string; created_at: string }> {
  const response = await fetch("/api/clinician/chart-notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId, content }),
  })

  const payload = (await response.json()) as {
    note?: { id: string; content: string; created_at: string }
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to save chart note")
  }

  if (!payload.note) {
    throw new Error("Chart note missing from API response")
  }

  return payload.note
}

export async function fetchClinicianChartNotes(patientId: string) {
  const response = await fetch(
    `/api/clinician/chart-notes?patientId=${encodeURIComponent(patientId)}`,
    { cache: "no-store" }
  )
  const payload = (await response.json()) as {
    notes?: { id: string; content: string; created_at: string }[]
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load chart notes")
  }

  return payload.notes ?? []
}

export async function updateClinicianProfile(
  profile: Partial<DoctorProfile>
): Promise<DoctorProfile> {
  const response = await fetch("/api/clinician/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  })

  const payload = (await response.json()) as {
    profile?: DoctorProfile
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to update profile")
  }

  if (!payload.profile) {
    throw new Error("Profile missing from API response")
  }

  return payload.profile
}

export async function fetchClinicianProfile(): Promise<DoctorProfile> {
  const response = await fetch("/api/clinician/profile", { cache: "no-store" })
  const payload = (await response.json()) as {
    profile?: DoctorProfile
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load profile")
  }

  if (!payload.profile) {
    throw new Error("Profile missing from API response")
  }

  return payload.profile
}

export async function createClinicianAppointment(input: {
  patientId: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  visitType: "in-person" | "telehealth" | "follow-up"
  reason?: string
}) {
  const response = await fetch("/api/clinician/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const payload = (await response.json()) as {
    appointment?: {
      id: string
      time: string
      patientId: string
      patientName: string
      type: string
      reason: string
      location: string
      href: string
    }
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to schedule appointment")
  }

  if (!payload.appointment) {
    throw new Error("Appointment missing from API response")
  }

  return payload.appointment
}
