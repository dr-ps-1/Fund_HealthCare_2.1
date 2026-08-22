import { Suspense } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { PatientProfileClient } from "./patient-profile-client"

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="py-12 text-center text-muted-foreground">
            Loading chart…
          </div>
        }
      >
        <PatientProfileClient params={params} />
      </Suspense>
    </AppShell>
  )
}
