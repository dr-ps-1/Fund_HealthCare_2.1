/** Vita AI Health Assistant patient portal (module 1.1). */

const DEFAULT_VITA_PATIENT_URL = "http://localhost:3001/dashboard"

export function getVitaPatientUrl(): string | null {
  const env = process.env.NEXT_PUBLIC_VITA_PATIENT_URL
  if (env === "") return null

  const candidate = env?.trim() || DEFAULT_VITA_PATIENT_URL
  try {
    return new URL(candidate).toString().replace(/\/$/, "")
  } catch {
    return null
  }
}

export function isVitaPatientLinkEnabled(): boolean {
  return getVitaPatientUrl() !== null
}

/** Build Vita URL with optional return link for a future “Back to iHealth” button in Vita. */
export function buildVitaPatientUrl(options?: {
  baseUrl?: string
  returnUrl?: string
}): string {
  const base = options?.baseUrl ?? getVitaPatientUrl()
  if (!base) return "/patient/local"

  const url = new URL(base)
  url.searchParams.set("from", "ihealth")

  const returnUrl =
    options?.returnUrl ??
    (typeof window !== "undefined" ? window.location.origin : "")

  if (returnUrl) {
    url.searchParams.set("returnUrl", returnUrl)
  }

  return url.toString()
}

export function goToVitaPatientPortal(): boolean {
  const vitaUrl = getVitaPatientUrl()
  if (!vitaUrl || typeof window === "undefined") return false
  window.location.assign(buildVitaPatientUrl({ baseUrl: vitaUrl }))
  return true
}
