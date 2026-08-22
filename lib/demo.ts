import { clearDemoClock, pinDemoClock } from "@/lib/demo-clock"
import {
  DEMO_SECONDARY_PATIENT_ID,
  DEMO_STAR_PATIENT_ID,
  DEMO_VITA_PATIENT_ID,
} from "@/lib/demo-patients"

export type DemoRole =
  | "patient"
  | "doctor"
  | "employer"
  | "insurance"
  | "government"

export const DEMO_ROLE_KEY = "demoRole"
export { DEMO_STAR_PATIENT_ID, DEMO_VITA_PATIENT_ID, DEMO_SECONDARY_PATIENT_ID }

export const roleRoutes: Record<DemoRole, string> = {
  patient: "/patient",
  doctor: "/doctor",
  employer: "/employer",
  insurance: "/insurance",
  government: "/government",
}

export const roleLabels: Record<DemoRole, string> = {
  patient: "Patient",
  doctor: "Doctor",
  employer: "Employer",
  insurance: "Insurance",
  government: "Government",
}

/** Reset demo session and return to clinician login. */
export function resetDemoMode() {
  if (typeof window === "undefined") return
  sessionStorage.clear()
  clearDemoClock()
}

export function setDemoRole(role: DemoRole) {
  if (typeof window === "undefined") return
  pinDemoClock(new Date())
  sessionStorage.setItem(DEMO_ROLE_KEY, role)
  // Demo-only UI session flag (AuthGuard). APIs are not authenticated.
  sessionStorage.setItem("isLoggedIn", "true")
  if (role === "doctor") {
    sessionStorage.setItem("userEmail", "sarah.wilson@clinic.com")
  }
  if (role === "patient") {
    sessionStorage.setItem("patientId", DEMO_STAR_PATIENT_ID)
  }
}

export function getDemoRole(): DemoRole | null {
  if (typeof window === "undefined") return null
  const value = sessionStorage.getItem(DEMO_ROLE_KEY)
  if (
    value === "patient" ||
    value === "doctor" ||
    value === "employer" ||
    value === "insurance" ||
    value === "government"
  ) {
    return value
  }
  return null
}
