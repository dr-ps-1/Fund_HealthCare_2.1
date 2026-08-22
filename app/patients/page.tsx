import { Suspense } from "react"
import { PatientPanelPage } from "@/components/patients/patient-panel-page"

export default function PatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading patient panel…
        </div>
      }
    >
      <PatientPanelPage />
    </Suspense>
  )
}
