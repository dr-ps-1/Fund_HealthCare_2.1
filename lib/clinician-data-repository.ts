import "server-only"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { DEMO_CLINICIAN_ID } from "@/lib/supabase/clinician-id"
import { getDemoPatientTier } from "@/lib/demo-patients"
import {
  alerts as seedAlerts,
  doctorProfile as seedDoctorProfile,
} from "@/lib/mock-data"
import {
  getAiSummaries,
  getDemoPatients,
  getTimelineEvents,
} from "@/lib/resolve-demo-dates"
import {
  getPhysicianInbox,
  getTodayAppointments,
} from "@/lib/doctor-dashboard-data"
import { formatWeekdayShort, toLocalDateIso } from "@/lib/calendar"
import { filterInboxForWorkqueue } from "@/lib/clinician-inbox-feed"
import type {
  AISummary,
  Alert,
  DoctorProfile,
  Patient,
  TimelineEvent,
} from "@/lib/types"
import type { InboxItem, TodayAppointment } from "@/lib/doctor-dashboard-data"

export type ClinicianPlatformData = {
  source: "mock" | "supabase"
  clinician: DoctorProfile
  patients: Patient[]
  alerts: Alert[]
  inbox: InboxItem[]
  appointments: TodayAppointment[]
  upcomingAppointments?: TodayAppointment[]
  calendarAppointments?: TodayAppointment[]
  timelineEvents: TimelineEvent[]
  aiSummaries: Record<string, AISummary>
}

type PanelPatientRow = {
  id: string
  clinician_id: string
  name: string
  age: number
  photo: string
  condition: string
  diagnosis: string
  risk_score: number
  status: Patient["status"]
  last_activity: string
  adherence_score: number
  days_since_visit: number
  last_visit_date: string
  icd_codes: string[]
  medications: string[]
  allergies: string[]
  key_metric: string
  city: string | null
  state: string | null
  zip: string | null
  date_of_birth: string | null
  insurance_payer: string | null
  insurance_plan: string | null
  member_id: string | null
  last_awv_date: string | null
  tier: string
  sort_order: number
}

type AlertRow = {
  id: string
  patient_id: string
  patient_name: string
  alert_type: Alert["type"]
  severity: Alert["severity"]
  headline: string
  cause: string
  metric: string | null
  time_label: string
  status: Alert["status"]
  sort_order: number
}

type InboxRow = {
  id: string
  kind: InboxItem["kind"]
  title: string
  patient_id: string
  patient_name: string
  priority: InboxItem["priority"]
  time_label: string
  href: string
  sort_order: number
}

type AppointmentRow = {
  id: string
  appointment_time: string
  patient_id: string
  patient_name: string
  appointment_type: string
  reason: string
  location: string
  is_next: boolean
  rpm_connected: boolean
  href: string
  sort_order: number
  appointment_date?: string | null
}

type TimelineRow = {
  id: string
  patient_id: string
  event_type: TimelineEvent["type"]
  event_date: string
  headline: string
  description: string
  full_text: string | null
  attachments: string[]
  sort_order: number
}

type AiSummaryRow = {
  patient_id: string
  title: string
  insights: string[]
  generated_at: string
}

type ClinicianRow = {
  id: string
  name: string
  specialization: string
  npi: string
  email: string
  phone: string
  photo: string
}

function mapPanelPatient(row: PanelPatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    condition: row.condition,
    diagnosis: row.diagnosis,
    riskScore: row.risk_score,
    status: row.status,
    lastActivity: row.last_activity,
    lastUpdate: row.last_activity,
    adherenceScore: row.adherence_score,
    daysSinceVisit: row.days_since_visit,
    lastVisitDate: row.last_visit_date,
    icdCodes: row.icd_codes ?? [],
    medications: row.medications ?? [],
    allergies: row.allergies ?? [],
    keyMetric: row.key_metric,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zip: row.zip ?? undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    insurancePayer: row.insurance_payer ?? undefined,
    insurancePlan: row.insurance_plan ?? undefined,
    memberId: row.member_id ?? undefined,
    lastAwvDate: row.last_awv_date ?? undefined,
  }
}

function mapAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    type: row.alert_type,
    severity: row.severity,
    headline: row.headline,
    cause: row.cause,
    metric: row.metric ?? undefined,
    time: row.time_label,
    status: row.status,
  }
}

function mapInbox(row: InboxRow): InboxItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    patientId: row.patient_id,
    patientName: row.patient_name,
    priority: row.priority,
    time: row.time_label,
    href: row.href,
  }
}

function todayIsoDate(): string {
  return toLocalDateIso()
}

function mapAppointment(row: AppointmentRow): TodayAppointment {
  const appointmentDate = row.appointment_date ?? undefined
  return {
    id: row.id,
    time: row.appointment_time,
    patientId: row.patient_id,
    patientName: row.patient_name,
    type: row.appointment_type,
    reason: row.reason,
    location: row.location,
    isNext: row.is_next,
    rpmConnected: row.rpm_connected,
    rpmSummary: row.rpm_connected
      ? "Home BP 152/88 · last device sync 6h ago"
      : undefined,
    isNewPatient:
      row.patient_id === "pending-new" ||
      row.appointment_type.toLowerCase().includes("new patient"),
    href: row.href,
    appointmentDate,
    dateLabel: appointmentDate ? formatWeekdayShort(appointmentDate) : undefined,
  }
}

function mapTimeline(row: TimelineRow): TimelineEvent {
  return {
    id: row.id,
    patientId: row.patient_id,
    type: row.event_type,
    date: row.event_date,
    headline: row.headline,
    description: row.description,
    fullText: row.full_text ?? undefined,
    attachments: row.attachments?.length ? row.attachments : undefined,
  }
}

function mapClinician(row: ClinicianRow): DoctorProfile {
  return {
    id: row.id,
    name: row.name,
    specialization: row.specialization,
    npi: row.npi,
    email: row.email,
    phone: row.phone,
    photo: row.photo,
  }
}

async function ensureDemoSeed() {
  const supabase = createSupabaseAdminClient()

  const { count, error } = await supabase
    .from("clinicians")
    .select("id", { count: "exact", head: true })

  if (error) {
    throw new Error(`Failed to check clinicians table: ${error.message}`)
  }

  if ((count ?? 0) > 0) return

  const { error: clinicianError } = await supabase.from("clinicians").insert({
    id: DEMO_CLINICIAN_ID,
    name: seedDoctorProfile.name,
    specialization: seedDoctorProfile.specialization,
    npi: seedDoctorProfile.npi,
    email: seedDoctorProfile.email,
    phone: seedDoctorProfile.phone,
    photo: seedDoctorProfile.photo,
  })

  if (clinicianError) {
    throw new Error(`Failed to seed clinician: ${clinicianError.message}`)
  }

  const patients = getDemoPatients()
  const panelRows = patients.map((patient, index) => ({
    id: patient.id,
    clinician_id: DEMO_CLINICIAN_ID,
    name: patient.name,
    age: patient.age,
    photo: patient.photo,
    condition: patient.condition,
    diagnosis: patient.diagnosis,
    risk_score: patient.riskScore,
    status: patient.status,
    last_activity: patient.lastActivity,
    adherence_score: patient.adherenceScore,
    days_since_visit: patient.daysSinceVisit,
    last_visit_date: patient.lastVisitDate,
    icd_codes: patient.icdCodes,
    medications: patient.medications,
    allergies: patient.allergies,
    key_metric: patient.keyMetric,
    city: patient.city ?? null,
    state: patient.state ?? null,
    zip: patient.zip ?? null,
    date_of_birth: patient.dateOfBirth ?? null,
    insurance_payer: patient.insurancePayer ?? null,
    insurance_plan: patient.insurancePlan ?? null,
    member_id: patient.memberId ?? null,
    last_awv_date: patient.lastAwvDate ?? null,
    tier: getDemoPatientTier(patient.id),
    sort_order: index,
  }))

  const { error: panelError } = await supabase
    .from("clinician_panel_patients")
    .insert(panelRows)

  if (panelError) {
    throw new Error(`Failed to seed panel patients: ${panelError.message}`)
  }

  const alertRows = seedAlerts.map((alert, index) => ({
    id: alert.id,
    clinician_id: DEMO_CLINICIAN_ID,
    patient_id: alert.patientId,
    patient_name: alert.patientName,
    alert_type: alert.type,
    severity: alert.severity,
    headline: alert.headline,
    cause: alert.cause,
    metric: alert.metric ?? null,
    time_label: alert.time,
    status: alert.status,
    sort_order: index,
  }))

  const { error: alertsError } = await supabase
    .from("clinician_alerts")
    .insert(alertRows)

  if (alertsError) {
    throw new Error(`Failed to seed alerts: ${alertsError.message}`)
  }

  const inbox = getPhysicianInbox()
  const inboxRows = inbox.map((item, index) => ({
    id: item.id,
    clinician_id: DEMO_CLINICIAN_ID,
    kind: item.kind,
    title: item.title,
    patient_id: item.patientId,
    patient_name: item.patientName,
    priority: item.priority,
    time_label: item.time,
    href: item.href,
    sort_order: index,
  }))

  const { error: inboxError } = await supabase
    .from("clinician_inbox_tasks")
    .insert(inboxRows)

  if (inboxError) {
    throw new Error(`Failed to seed inbox: ${inboxError.message}`)
  }

  const appointments = getTodayAppointments()
  const appointmentDate = todayIsoDate()
  const appointmentRows = appointments.map((appt, index) => ({
    id: appt.id,
    clinician_id: DEMO_CLINICIAN_ID,
    appointment_time: appt.time,
    patient_id: appt.patientId,
    patient_name: appt.patientName,
    appointment_type: appt.type,
    reason: appt.reason,
    location: appt.location,
    is_next: appt.isNext ?? false,
    rpm_connected: appt.rpmConnected ?? false,
    href: appt.href,
    sort_order: index,
    appointment_date: appointmentDate,
  }))

  const { error: apptError } = await supabase
    .from("clinician_appointments")
    .insert(appointmentRows)

  if (apptError) {
    throw new Error(`Failed to seed appointments: ${apptError.message}`)
  }

  const timeline = getTimelineEvents()
  const timelineRows = timeline.map((event, index) => ({
    id: event.id,
    patient_id: event.patientId,
    event_type: event.type,
    event_date: event.date,
    headline: event.headline,
    description: event.description,
    full_text: event.fullText ?? null,
    attachments: event.attachments ?? [],
    sort_order: index,
  }))

  const { error: timelineError } = await supabase
    .from("clinician_timeline_events")
    .insert(timelineRows)

  if (timelineError) {
    throw new Error(`Failed to seed timeline: ${timelineError.message}`)
  }

  const aiSummaries = getAiSummaries()
  const summaryRows = Object.values(aiSummaries).map((summary) => ({
    patient_id: summary.patientId,
    title: summary.title,
    insights: summary.insights,
    generated_at: summary.generatedAt,
  }))

  const { error: summaryError } = await supabase
    .from("clinician_ai_summaries")
    .insert(summaryRows)

  if (summaryError) {
    throw new Error(`Failed to seed AI summaries: ${summaryError.message}`)
  }
}

async function ensureTodayAppointments() {
  const supabase = createSupabaseAdminClient()
  const appointmentDate = todayIsoDate()

  const { count, error } = await supabase
    .from("clinician_appointments")
    .select("id", { count: "exact", head: true })
    .eq("clinician_id", DEMO_CLINICIAN_ID)
    .eq("appointment_date", appointmentDate)

  if (error) {
    throw new Error(`Failed to check today's appointments: ${error.message}`)
  }

  if ((count ?? 0) > 0) return

  const appointments = getTodayAppointments()
  const appointmentRows = appointments.map((appt, index) => ({
    id: `${appt.id}-${appointmentDate.replace(/-/g, "")}`,
    clinician_id: DEMO_CLINICIAN_ID,
    appointment_time: appt.time,
    patient_id: appt.patientId,
    patient_name: appt.patientName,
    appointment_type: appt.type,
    reason: appt.reason,
    location: appt.location,
    is_next: appt.isNext ?? false,
    rpm_connected: appt.rpmConnected ?? false,
    href: appt.href,
    sort_order: index,
    appointment_date: appointmentDate,
  }))

  const { error: insertError } = await supabase
    .from("clinician_appointments")
    .insert(appointmentRows)

  if (insertError) {
    throw new Error(`Failed to seed today's appointments: ${insertError.message}`)
  }
}

export async function loadClinicianPlatformData(): Promise<ClinicianPlatformData> {
  await ensureDemoSeed()
  await ensureTodayAppointments()

  const supabase = createSupabaseAdminClient()

  const [
    { data: clinicianRow, error: clinicianError },
    { data: patientRows, error: patientsError },
    { data: alertRows, error: alertsError },
    { data: inboxRows, error: inboxError },
    { data: appointmentRows, error: apptError },
    { data: timelineRows, error: timelineError },
    { data: summaryRows, error: summaryError },
  ] = await Promise.all([
    supabase.from("clinicians").select("*").eq("id", DEMO_CLINICIAN_ID).single(),
    supabase
      .from("clinician_panel_patients")
      .select("*")
      .eq("clinician_id", DEMO_CLINICIAN_ID)
      .order("sort_order"),
    supabase
      .from("clinician_alerts")
      .select("*")
      .eq("clinician_id", DEMO_CLINICIAN_ID)
      .order("sort_order"),
    supabase
      .from("clinician_inbox_tasks")
      .select("*")
      .eq("clinician_id", DEMO_CLINICIAN_ID)
      .order("sort_order"),
    supabase
      .from("clinician_appointments")
      .select("*")
      .eq("clinician_id", DEMO_CLINICIAN_ID)
      .order("appointment_date")
      .order("sort_order"),
    supabase.from("clinician_timeline_events").select("*").order("sort_order"),
    supabase.from("clinician_ai_summaries").select("*"),
  ])

  if (clinicianError || !clinicianRow) {
    throw new Error(`Failed to load clinician: ${clinicianError?.message}`)
  }
  if (patientsError) {
    throw new Error(`Failed to load panel patients: ${patientsError.message}`)
  }
  if (alertsError) {
    throw new Error(`Failed to load alerts: ${alertsError.message}`)
  }
  if (inboxError) {
    throw new Error(`Failed to load inbox: ${inboxError.message}`)
  }
  if (apptError) {
    throw new Error(`Failed to load appointments: ${apptError.message}`)
  }
  if (timelineError) {
    throw new Error(`Failed to load timeline: ${timelineError.message}`)
  }
  if (summaryError) {
    throw new Error(`Failed to load AI summaries: ${summaryError.message}`)
  }

  const aiSummaries: Record<string, AISummary> = {}
  for (const row of (summaryRows ?? []) as AiSummaryRow[]) {
    aiSummaries[row.patient_id] = {
      patientId: row.patient_id,
      title: row.title,
      insights: row.insights ?? [],
      generatedAt: row.generated_at,
    }
  }

  const allAppointments = ((appointmentRows ?? []) as AppointmentRow[]).map(
    mapAppointment
  )
  const today = todayIsoDate()

  return {
    source: "supabase",
    clinician: mapClinician(clinicianRow as ClinicianRow),
    patients: ((patientRows ?? []) as PanelPatientRow[]).map(mapPanelPatient),
    alerts: ((alertRows ?? []) as AlertRow[]).map(mapAlert),
    inbox: filterInboxForWorkqueue(
      ((inboxRows ?? []) as InboxRow[]).map(mapInbox)
    ),
    appointments: allAppointments.filter(
      (appointment) => appointment.appointmentDate === today
    ),
    upcomingAppointments: allAppointments.filter(
      (appointment) => (appointment.appointmentDate ?? "") > today
    ),
    calendarAppointments: allAppointments,
    timelineEvents: ((timelineRows ?? []) as TimelineRow[]).map(mapTimeline),
    aiSummaries,
  }
}

export async function getPanelPatientFromSupabase(
  patientId: string
): Promise<Patient | null> {
  await ensureDemoSeed()
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("clinician_panel_patients")
    .select("*")
    .eq("clinician_id", DEMO_CLINICIAN_ID)
    .eq("id", patientId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load patient ${patientId}: ${error.message}`)
  }

  return data ? mapPanelPatient(data as PanelPatientRow) : null
}

export async function getPatientChartContextFromSupabase(patientId: string): Promise<{
  alerts: Alert[]
  timeline: TimelineEvent[]
  summary?: AISummary
}> {
  await ensureDemoSeed()
  const supabase = createSupabaseAdminClient()

  const [
    { data: alertRows, error: alertsError },
    { data: timelineRows, error: timelineError },
    { data: summaryRow, error: summaryError },
  ] = await Promise.all([
    supabase
      .from("clinician_alerts")
      .select("*")
      .eq("clinician_id", DEMO_CLINICIAN_ID)
      .eq("patient_id", patientId)
      .eq("status", "active"),
    supabase
      .from("clinician_timeline_events")
      .select("*")
      .eq("patient_id", patientId)
      .order("sort_order")
      .limit(8),
    supabase
      .from("clinician_ai_summaries")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle(),
  ])

  if (alertsError) {
    throw new Error(`Failed to load alerts: ${alertsError.message}`)
  }
  if (timelineError) {
    throw new Error(`Failed to load timeline: ${timelineError.message}`)
  }
  if (summaryError) {
    throw new Error(`Failed to load summary: ${summaryError.message}`)
  }

  const row = summaryRow as AiSummaryRow | null
  const summary = row
    ? {
        patientId: row.patient_id,
        title: row.title,
        insights: row.insights ?? [],
        generatedAt: row.generated_at,
      }
    : undefined

  return {
    alerts: ((alertRows ?? []) as AlertRow[]).map(mapAlert),
    timeline: ((timelineRows ?? []) as TimelineRow[]).map(mapTimeline),
    summary,
  }
}

export async function acknowledgeAlertInSupabase(alertId: string) {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("clinician_alerts")
    .update({ status: "resolved", updated_at: new Date().toISOString() })
    .eq("id", alertId)
    .eq("clinician_id", DEMO_CLINICIAN_ID)

  if (error) {
    throw new Error(`Failed to acknowledge alert: ${error.message}`)
  }
}

export async function completeInboxTaskInSupabase(taskId: string) {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("clinician_inbox_tasks")
    .delete()
    .eq("id", taskId)
    .eq("clinician_id", DEMO_CLINICIAN_ID)

  if (error) {
    throw new Error(`Failed to complete inbox task: ${error.message}`)
  }
}

export async function saveChartNoteInSupabase(patientId: string, content: string) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("clinician_chart_notes")
    .insert({
      clinician_id: DEMO_CLINICIAN_ID,
      patient_id: patientId,
      content: content.trim(),
    })
    .select("id, content, created_at")
    .single()

  if (error || !data) {
    throw new Error(`Failed to save chart note: ${error?.message ?? "unknown"}`)
  }

  return data as { id: string; content: string; created_at: string }
}

export async function listChartNotesFromSupabase(patientId: string) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("clinician_chart_notes")
    .select("id, content, created_at")
    .eq("clinician_id", DEMO_CLINICIAN_ID)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to load chart notes: ${error.message}`)
  }

  return (data ?? []) as { id: string; content: string; created_at: string }[]
}

export async function updateClinicianProfileInSupabase(
  profile: Partial<DoctorProfile>
) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("clinicians")
    .update({
      name: profile.name,
      specialization: profile.specialization,
      npi: profile.npi,
      email: profile.email,
      phone: profile.phone,
      photo: profile.photo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", DEMO_CLINICIAN_ID)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`Failed to update profile: ${error?.message ?? "unknown"}`)
  }

  return mapClinician(data as ClinicianRow)
}

export type CreateAppointmentInput = {
  patientId: string
  patientName: string
  appointmentDate: string
  appointmentTime24: string
  visitType: "in-person" | "telehealth" | "follow-up"
  reason?: string
}

function formatTime12h(time24: string): string {
  const [hourPart, minutePart] = time24.split(":")
  const hour = Number(hourPart)
  const minute = Number(minutePart)
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error("Invalid time format")
  }
  const period = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`
}

function visitTypeLabel(
  visitType: CreateAppointmentInput["visitType"]
): string {
  switch (visitType) {
    case "telehealth":
      return "Telehealth"
    case "follow-up":
      return "Follow-up"
    default:
      return "Office visit"
  }
}

function visitLocation(visitType: CreateAppointmentInput["visitType"]): string {
  return visitType === "telehealth" ? "Telehealth" : "Exam 4 · In-person"
}

export async function createAppointmentInSupabase(
  input: CreateAppointmentInput
): Promise<TodayAppointment> {
  const supabase = createSupabaseAdminClient()
  const appointmentTime = formatTime12h(input.appointmentTime24)
  const appointmentType = visitTypeLabel(input.visitType)
  const location = visitLocation(input.visitType)
  const reason = input.reason?.trim() || "Follow-up scheduled from chart"

  const { data: lastRow } = await supabase
    .from("clinician_appointments")
    .select("sort_order")
    .eq("clinician_id", DEMO_CLINICIAN_ID)
    .eq("appointment_date", input.appointmentDate)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder =
    ((lastRow as { sort_order?: number } | null)?.sort_order ?? -1) + 1
  const id = `appt-${Date.now()}`

  const { data, error } = await supabase
    .from("clinician_appointments")
    .insert({
      id,
      clinician_id: DEMO_CLINICIAN_ID,
      appointment_time: appointmentTime,
      patient_id: input.patientId,
      patient_name: input.patientName,
      appointment_type: appointmentType,
      reason,
      location,
      is_next: false,
      rpm_connected: false,
      href: `/patients/${input.patientId}`,
      sort_order: sortOrder,
      appointment_date: input.appointmentDate,
    })
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(
      `Failed to create appointment: ${error?.message ?? "unknown"}`
    )
  }

  return mapAppointment(data as AppointmentRow)
}

export { DEMO_CLINICIAN_ID }
