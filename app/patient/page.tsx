import { VitaPatientRedirect } from "@/components/patient/vita-patient-redirect"
import { RoleShell } from "@/components/layout/role-shell"
import { getVitaPatientUrl } from "@/lib/vita-link"
import { redirect } from "next/navigation"

export default function PatientPortalPage() {
  const vitaUrl = getVitaPatientUrl()

  if (!vitaUrl) {
    redirect("/patient/local")
  }

  return (
    <RoleShell role="patient">
      <VitaPatientRedirect />
    </RoleShell>
  )
}
