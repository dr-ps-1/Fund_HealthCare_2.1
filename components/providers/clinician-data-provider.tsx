"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { isSupabaseMessagingEnabled } from "@/lib/config/public-env"
import {
  acknowledgeClinicianAlert,
  completeClinicianInboxTask,
  createClinicianAppointment,
  fetchClinicianPlatformData,
  type ClinicianDataResponse,
} from "@/lib/clinician-data-api"
import { alerts as mockAlerts, doctorProfile as mockClinician } from "@/lib/mock-data"
import {
  getAiSummaries,
  getDemoPatients,
  getTimelineEvents,
} from "@/lib/resolve-demo-dates"
import { ensureDemoClockForToday } from "@/lib/demo-clock"
import {
  getPhysicianInbox,
  type InboxItem,
  type TodayAppointment,
} from "@/lib/doctor-dashboard-data"
import {
  cancelLocalAppointment,
  getAllCalendarAppointments,
  getMockUpcomingAppointments,
  getMockTodayAppointments,
  saveLocalAppointment,
  updateLocalAppointment,
  withLocalAppointments,
  type LocalAppointmentInput,
} from "@/lib/appointments-local"
import { filterInboxForWorkqueue } from "@/lib/clinician-inbox-feed"
import type {
  AISummary,
  Alert,
  DoctorProfile,
  Patient,
  TimelineEvent,
} from "@/lib/types"

type ClinicianDataContextValue = {
  source: "mock" | "supabase" | "loading"
  loading: boolean
  error: string | null
  clinician: DoctorProfile
  patients: Patient[]
  alerts: Alert[]
  inbox: InboxItem[]
  appointments: TodayAppointment[]
  upcomingAppointments: TodayAppointment[]
  calendarAppointments: TodayAppointment[]
  timelineEvents: TimelineEvent[]
  aiSummaries: Record<string, AISummary>
  refresh: () => Promise<void>
  updateClinician: (profile: DoctorProfile) => void
  scheduleAppointment: (input: LocalAppointmentInput) => Promise<void>
  updateAppointment: (
    id: string,
    input: LocalAppointmentInput
  ) => Promise<void>
  cancelAppointment: (id: string) => Promise<void>
  acknowledgeAlert: (alertId: string) => Promise<void>
  completeInboxTask: (taskId: string) => Promise<void>
  getPatientById: (id: string) => Patient | undefined
  getTimelineForPatient: (patientId: string) => TimelineEvent[]
  getAiSummaryForPatient: (patientId: string) => AISummary | undefined
}

const ClinicianDataContext = createContext<ClinicianDataContextValue | null>(null)

function buildMockFallback() {
  return {
    source: "mock" as const,
    clinician: mockClinician,
    patients: getDemoPatients(),
    alerts: mockAlerts,
    inbox: filterInboxForWorkqueue(getPhysicianInbox()),
    appointments: getMockTodayAppointments(),
    upcomingAppointments: getMockUpcomingAppointments(),
    calendarAppointments: getAllCalendarAppointments(),
    timelineEvents: getTimelineEvents(),
    aiSummaries: getAiSummaries(),
  }
}

function mapResponse(data: ClinicianDataResponse): Omit<
  ClinicianDataContextValue,
  "loading" | "error" | "refresh" | "updateClinician" | "scheduleAppointment" | "updateAppointment" | "cancelAppointment" | "acknowledgeAlert" | "completeInboxTask" | "getPatientById" | "getTimelineForPatient" | "getAiSummaryForPatient"
> {
  return {
    source: data.source,
    clinician: data.clinician,
    patients: data.patients,
    alerts: data.alerts,
    inbox: data.inbox,
    appointments: data.appointments,
    upcomingAppointments: data.upcomingAppointments ?? [],
    calendarAppointments:
      data.calendarAppointments ??
      [...data.appointments, ...(data.upcomingAppointments ?? [])],
    timelineEvents: data.timelineEvents,
    aiSummaries: data.aiSummaries,
  }
}

export function ClinicianDataProvider({ children }: { children: ReactNode }) {
  const supabaseEnabled = isSupabaseMessagingEnabled()
  const [state, setState] = useState(() =>
    mapResponse({
      ...buildMockFallback(),
      ...withLocalAppointments({
        appointments: getMockTodayAppointments(),
        upcomingAppointments: getMockUpcomingAppointments(),
        calendarAppointments: getAllCalendarAppointments(),
      }),
      source: "mock",
    })
  )
  const [loading, setLoading] = useState(supabaseEnabled)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    ensureDemoClockForToday()

    if (!supabaseEnabled) {
      setState(
        mapResponse({
          ...buildMockFallback(),
          ...withLocalAppointments({
            appointments: getMockTodayAppointments(),
            upcomingAppointments: getMockUpcomingAppointments(),
            calendarAppointments: getAllCalendarAppointments(),
          }),
          source: "mock",
        })
      )
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await fetchClinicianPlatformData()
      const mapped = mapResponse(data)
      setState({
        ...mapped,
        ...withLocalAppointments(mapped),
      })
      setError(null)
    } catch {
      setError(null)
      setState(
        mapResponse({
          ...buildMockFallback(),
          ...withLocalAppointments({
            appointments: getMockTodayAppointments(),
            upcomingAppointments: getMockUpcomingAppointments(),
            calendarAppointments: getAllCalendarAppointments(),
          }),
          source: "mock",
        })
      )
    } finally {
      setLoading(false)
    }
  }, [supabaseEnabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      setState((prev) => ({
        ...prev,
        alerts: prev.alerts.map((alert) =>
          alert.id === alertId ? { ...alert, status: "resolved" as const } : alert
        ),
      }))

      if (supabaseEnabled) {
        try {
          await acknowledgeClinicianAlert(alertId)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to acknowledge alert")
          void refresh()
        }
      }
    },
    [supabaseEnabled, refresh]
  )

  const completeInboxTask = useCallback(
    async (taskId: string) => {
      setState((prev) => ({
        ...prev,
        inbox: prev.inbox.filter((item) => item.id !== taskId),
      }))

      if (supabaseEnabled) {
        try {
          await completeClinicianInboxTask(taskId)
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to complete inbox task"
          )
          void refresh()
        }
      }
    },
    [supabaseEnabled, refresh]
  )

  const updateClinician = useCallback((profile: DoctorProfile) => {
    setState((prev) => ({ ...prev, clinician: profile }))
  }, [])

  const scheduleAppointment = useCallback(
    async (input: LocalAppointmentInput) => {
      saveLocalAppointment(input)
      setState((prev) => ({
        ...prev,
        ...withLocalAppointments({
          appointments: prev.appointments,
          upcomingAppointments: prev.upcomingAppointments,
          calendarAppointments: prev.calendarAppointments,
        }),
      }))

      if (supabaseEnabled) {
        try {
          await createClinicianAppointment(input)
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Saved locally; cloud sync failed"
          )
        }
      }
    },
    [supabaseEnabled]
  )

  const refreshAppointments = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ...withLocalAppointments({
        appointments: prev.appointments,
        upcomingAppointments: prev.upcomingAppointments,
        calendarAppointments: prev.calendarAppointments,
      }),
    }))
  }, [])

  const updateAppointment = useCallback(
    async (id: string, input: LocalAppointmentInput) => {
      updateLocalAppointment(id, input)
      refreshAppointments()
    },
    [refreshAppointments]
  )

  const cancelAppointment = useCallback(
    async (id: string) => {
      cancelLocalAppointment(id)
      refreshAppointments()
    },
    [refreshAppointments]
  )

  const value = useMemo<ClinicianDataContextValue>(
    () => ({
      ...state,
      loading,
      error,
      refresh,
      updateClinician,
      scheduleAppointment,
      updateAppointment,
      cancelAppointment,
      acknowledgeAlert,
      completeInboxTask,
      getPatientById: (id) => state.patients.find((p) => p.id === id),
      getTimelineForPatient: (patientId) =>
        state.timelineEvents.filter((e) => e.patientId === patientId),
      getAiSummaryForPatient: (patientId) => state.aiSummaries[patientId],
    }),
    [state, loading, error, refresh, updateClinician, scheduleAppointment, updateAppointment, cancelAppointment, acknowledgeAlert, completeInboxTask]
  )

  return (
    <ClinicianDataContext.Provider value={value}>
      {children}
    </ClinicianDataContext.Provider>
  )
}

export function useClinicianData() {
  const ctx = useContext(ClinicianDataContext)
  if (!ctx) {
    throw new Error("useClinicianData must be used within ClinicianDataProvider")
  }
  return ctx
}

/** Safe hook — returns mock data when provider is absent (e.g. tests). */
export function useClinicianDataOptional(): ClinicianDataContextValue {
  const ctx = useContext(ClinicianDataContext)
  if (ctx) return ctx

  const fallback = buildMockFallback()
  return {
    ...mapResponse({ ...fallback, source: "mock" }),
    loading: false,
    error: null,
    refresh: async () => {},
    updateClinician: () => {},
    scheduleAppointment: async () => {},
    updateAppointment: async () => {},
    cancelAppointment: async () => {},
    acknowledgeAlert: async () => {},
    completeInboxTask: async () => {},
    getPatientById: (id) => fallback.patients.find((p) => p.id === id),
    getTimelineForPatient: (patientId) =>
      fallback.timelineEvents.filter((e) => e.patientId === patientId),
    getAiSummaryForPatient: (patientId) => fallback.aiSummaries[patientId],
  }
}
