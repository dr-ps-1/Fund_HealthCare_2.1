/** Demo patient tiers for doctor panel (module 2.1). Vita AI code stays unchanged. */

/** Ava Jackson — primary demo patient and Vita RPM member (same person on both platforms). */
export const DEMO_STAR_PATIENT_ID = "9"
/** Alias: Vita-linked RPM patient is the demo star. */
export const DEMO_VITA_PATIENT_ID = DEMO_STAR_PATIENT_ID
/** Sarah Johnson — additional full-chart patient (diabetes / HbA1c story). */
export const DEMO_SECONDARY_PATIENT_ID = "1"

export type DemoPatientTier = "star" | "vita-linked" | "secondary" | "panel-only"

export function getDemoPatientTier(patientId: string): DemoPatientTier {
  if (patientId === DEMO_STAR_PATIENT_ID) return "star"
  if (patientId === DEMO_SECONDARY_PATIENT_ID) return "secondary"
  return "panel-only"
}

export function isFullChartPatient(patientId: string): boolean {
  const tier = getDemoPatientTier(patientId)
  return tier === "star" || tier === "secondary" || tier === "vita-linked"
}

export function demoPatientTierLabel(tier: DemoPatientTier): string | null {
  switch (tier) {
    case "star":
      return "Demo star"
    case "secondary":
      return "Full chart"
    case "vita-linked":
      return "Vita AI"
    default:
      return null
  }
}
