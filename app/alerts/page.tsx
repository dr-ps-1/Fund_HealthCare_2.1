import { Suspense } from "react"
import { AlertsWorkqueuePage } from "@/components/alerts/alerts-workqueue-page"

export default function AlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading alerts…
        </div>
      }
    >
      <AlertsWorkqueuePage />
    </Suspense>
  )
}
