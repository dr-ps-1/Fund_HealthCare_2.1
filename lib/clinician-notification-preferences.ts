"use client"

import { useCallback, useEffect, useState } from "react"

export type ClinicianNotificationPreferences = {
  urgentAlerts: boolean
  inboxTasks: boolean
  patientMessages: boolean
  systemUpdates: boolean
}

export const DEFAULT_CLINICIAN_NOTIFICATION_PREFERENCES: ClinicianNotificationPreferences =
  {
    urgentAlerts: true,
    inboxTasks: true,
    patientMessages: true,
    systemUpdates: true,
  }

const STORAGE_KEY = "clinicianNotificationPreferences"
const CHANGE_EVENT = "clinician-notification-prefs"

export function loadClinicianNotificationPreferences(): ClinicianNotificationPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_CLINICIAN_NOTIFICATION_PREFERENCES
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CLINICIAN_NOTIFICATION_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<ClinicianNotificationPreferences>
    return {
      ...DEFAULT_CLINICIAN_NOTIFICATION_PREFERENCES,
      ...parsed,
    }
  } catch {
    return DEFAULT_CLINICIAN_NOTIFICATION_PREFERENCES
  }
}

export function saveClinicianNotificationPreferences(
  preferences: ClinicianNotificationPreferences
) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useClinicianNotificationPreferences() {
  const [preferences, setPreferences] = useState(
    DEFAULT_CLINICIAN_NOTIFICATION_PREFERENCES
  )

  useEffect(() => {
    setPreferences(loadClinicianNotificationPreferences())
    const onChange = () =>
      setPreferences(loadClinicianNotificationPreferences())
    window.addEventListener(CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CHANGE_EVENT, onChange)
  }, [])

  const updatePreferences = useCallback(
    (patch: Partial<ClinicianNotificationPreferences>) => {
      const next = { ...loadClinicianNotificationPreferences(), ...patch }
      saveClinicianNotificationPreferences(next)
      setPreferences(next)
    },
    []
  )

  return { preferences, updatePreferences }
}
