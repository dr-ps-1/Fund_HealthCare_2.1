import { DEMO_STAR_PATIENT_ID, DEMO_VITA_PATIENT_ID } from "@/lib/demo-patients"
import type { Alert, Patient } from "@/lib/types"
import type { InboxItem, TodayAppointment } from "@/lib/doctor-dashboard-data"

export type PanelRosterFilter = "all" | "urgent" | "attention" | "overdue" | "rpm"

export type PanelRosterSort = "risk" | "lastVisit" | "name"

export type PanelRosterStats = {
  total: number
  urgent: number
  attention: number
  overdue: number
  rpmConnected: number
}

export type PatientOpenItems = {
  alertCount: number
  taskCount: number
}

export function computePanelRosterStats(patients: Patient[]): PanelRosterStats {
  return {
    total: patients.length,
    urgent: patients.filter((p) => p.status === "red").length,
    attention: patients.filter((p) => p.status === "yellow").length,
    overdue: patients.filter((p) => p.daysSinceVisit >= 60).length,
    rpmConnected: patients.filter((p) => p.id === DEMO_VITA_PATIENT_ID).length,
  }
}

export function getPatientOpenItems(
  patientId: string,
  alerts: Alert[],
  inbox: InboxItem[]
): PatientOpenItems {
  return {
    alertCount: alerts.filter(
      (a) => a.patientId === patientId && a.status === "active"
    ).length,
    taskCount: inbox.filter((i) => i.patientId === patientId).length,
  }
}

export function getPatientNextVisitLabel(
  patientId: string,
  appointments: TodayAppointment[]
): string | null {
  const appt = appointments.find((a) => a.patientId === patientId)
  if (!appt) return null
  return appt.time
}

export function sortPanelPatients(
  patients: Patient[],
  sort: PanelRosterSort
): Patient[] {
  return [...patients].sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name)
      case "lastVisit":
        return b.daysSinceVisit - a.daysSinceVisit
      default:
        if (a.id === DEMO_STAR_PATIENT_ID) return -1
        if (b.id === DEMO_STAR_PATIENT_ID) return 1
        return b.riskScore - a.riskScore
    }
  })
}

export function buildPanelRosterSearchParams(input: {
  search?: string
  filter?: PanelRosterFilter
  condition?: string
  sort?: PanelRosterSort
}): string {
  const params = new URLSearchParams()
  const search = input.search?.trim()
  if (search) params.set("search", search)
  if (input.filter && input.filter !== "all") params.set("filter", input.filter)
  if (input.condition && input.condition !== "all") {
    params.set("condition", input.condition)
  }
  if (input.sort && input.sort !== "risk") params.set("sort", input.sort)
  const query = params.toString()
  return query ? `?${query}` : ""
}

export function parseRosterSortFromSearchParams(
  sort?: string | null
): PanelRosterSort {
  if (sort === "lastVisit" || sort === "name") return sort
  return "risk"
}

export function parseRosterFilterFromSearchParams(params: {
  status?: string | null
  filter?: string | null
}): PanelRosterFilter {
  const filter = params.filter?.toLowerCase()
  if (
    filter === "urgent" ||
    filter === "attention" ||
    filter === "overdue" ||
    filter === "rpm" ||
    filter === "all"
  ) {
    return filter
  }
  if (params.status === "red") return "urgent"
  if (params.status === "yellow") return "attention"
  return "all"
}

export function matchesRosterFilter(
  patient: { id: string; status: string; daysSinceVisit: number },
  filter: PanelRosterFilter
): boolean {
  switch (filter) {
    case "urgent":
      return patient.status === "red"
    case "attention":
      return patient.status === "yellow"
    case "overdue":
      return patient.daysSinceVisit >= 60
    case "rpm":
      return patient.id === DEMO_VITA_PATIENT_ID
    default:
      return true
  }
}

export function formatPatientMrn(patientId: string): string {
  return String(100000 + Number(patientId))
}

export function formatPatientLocation(patient: {
  city?: string
  state?: string
}): string {
  return [patient.city, patient.state].filter(Boolean).join(", ")
}

export function formatPayerShort(patient: {
  insurancePayer?: string
}): string | null {
  if (!patient.insurancePayer) return null
  if (/medicare/i.test(patient.insurancePayer)) return "Medicare"
  if (/blue cross/i.test(patient.insurancePayer)) return "BCBS"
  return patient.insurancePayer.split(" ")[0]
}
