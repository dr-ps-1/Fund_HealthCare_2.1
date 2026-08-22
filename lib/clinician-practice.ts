export const CLINICIAN_PRACTICE = {
  organization: "iHealth Internal Medicine",
  region: "Miami-Dade",
  ehr: "Epic MyChart",
} as const

export function formatClinicianOrganization(): string {
  return `${CLINICIAN_PRACTICE.organization} · ${CLINICIAN_PRACTICE.region}`
}
