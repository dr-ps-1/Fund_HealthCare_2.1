import "server-only"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { DEMO_CLINICIAN_ID } from "@/lib/supabase/clinician-id"
import { getPanelPatientFromSupabase } from "@/lib/clinician-data-repository"
import { demoNow } from "@/lib/demo-clock"
import { getDemoPatients, messages as seedMessages } from "@/lib/mock-data"
import type { Message } from "@/lib/types"

type DbMessageRow = {
  id: string
  demo_patient_id: string
  patient_name: string
  patient_photo: string
  content: string
  is_from_doctor: boolean
  sent_at: string
}

type DbReadRow = {
  demo_patient_id: string
}

function formatMessageTime(sentAt: string): string {
  const date = new Date(sentAt)
  const now = demoNow()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (date >= startOfToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }
  if (date >= startOfYesterday) {
    return "Yesterday"
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function mapRow(row: DbMessageRow): Message {
  return {
    id: row.id,
    patientId: row.demo_patient_id,
    patientName: row.patient_name,
    patientPhoto: row.patient_photo,
    content: row.content,
    time: formatMessageTime(row.sent_at),
    isFromDoctor: row.is_from_doctor,
  }
}

async function ensureSeedMessages() {
  const supabase = createSupabaseAdminClient()
  const { count, error: countError } = await supabase
    .from("clinician_patient_messages")
    .select("id", { count: "exact", head: true })

  if (countError) {
    throw new Error(`Failed to check clinician messages: ${countError.message}`)
  }

  if ((count ?? 0) > 0) return

  const now = demoNow()
  const rows = seedMessages.map((message, index) => ({
    demo_patient_id: message.patientId,
    patient_name: message.patientName,
    patient_photo: message.patientPhoto,
    content: message.content,
    is_from_doctor: message.isFromDoctor,
    sent_at: new Date(now.getTime() - (seedMessages.length - index) * 60_000).toISOString(),
  }))

  const { error } = await supabase.from("clinician_patient_messages").insert(rows)
  if (error) {
    throw new Error(`Failed to seed clinician messages: ${error.message}`)
  }
}

export async function listClinicianMessagesFromSupabase(): Promise<{
  messages: Message[]
  readPatientIds: string[]
}> {
  await ensureSeedMessages()

  const supabase = createSupabaseAdminClient()

  const [{ data: messageRows, error: messagesError }, { data: readRows, error: readError }] =
    await Promise.all([
      supabase
        .from("clinician_patient_messages")
        .select("*")
        .order("sent_at", { ascending: true }),
      supabase
        .from("clinician_message_read_state")
        .select("demo_patient_id")
        .eq("clinician_id", DEMO_CLINICIAN_ID),
    ])

  if (messagesError) {
    throw new Error(`Failed to load clinician messages: ${messagesError.message}`)
  }
  if (readError) {
    throw new Error(`Failed to load read state: ${readError.message}`)
  }

  return {
    messages: (messageRows as DbMessageRow[]).map(mapRow),
    readPatientIds: (readRows as DbReadRow[]).map((row) => row.demo_patient_id),
  }
}

export async function sendClinicianMessageToSupabase(
  patientId: string,
  content: string
): Promise<Message> {
  const patient =
    (await getPanelPatientFromSupabase(patientId)) ??
    getDemoPatients().find((p) => p.id === patientId)
  if (!patient) {
    throw new Error(`Unknown patient id: ${patientId}`)
  }

  const supabase = createSupabaseAdminClient()
  const sentAt = demoNow().toISOString()

  const { data, error } = await supabase
    .from("clinician_patient_messages")
    .insert({
      demo_patient_id: patientId,
      patient_name: patient.name,
      patient_photo: patient.photo,
      content: content.trim(),
      is_from_doctor: true,
      sent_at: sentAt,
    })
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`Failed to send message: ${error?.message ?? "unknown error"}`)
  }

  await markClinicianThreadReadInSupabase(patientId)

  return mapRow(data as DbMessageRow)
}

export async function markClinicianThreadReadInSupabase(patientId: string) {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase.from("clinician_message_read_state").upsert(
    {
      clinician_id: DEMO_CLINICIAN_ID,
      demo_patient_id: patientId,
      read_at: demoNow().toISOString(),
    },
    { onConflict: "clinician_id,demo_patient_id" }
  )

  if (error) {
    throw new Error(`Failed to mark thread read: ${error.message}`)
  }
}

export async function markAllClinicianThreadsReadInSupabase(patientIds: string[]) {
  if (patientIds.length === 0) return

  const supabase = createSupabaseAdminClient()
  const readAt = demoNow().toISOString()

  const { error } = await supabase.from("clinician_message_read_state").upsert(
    patientIds.map((patientId) => ({
      clinician_id: DEMO_CLINICIAN_ID,
      demo_patient_id: patientId,
      read_at: readAt,
    })),
    { onConflict: "clinician_id,demo_patient_id" }
  )

  if (error) {
    throw new Error(`Failed to mark all threads read: ${error.message}`)
  }
}

export function getDemoClinicianId() {
  return DEMO_CLINICIAN_ID
}
