"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useClinicianData } from "@/components/providers/clinician-data-provider"

export function ClinicianDataStatus() {
  const { loading, error, refresh, patients } = useClinicianData()
  const hasPanel = patients.length > 0

  if (error) {
    return (
      <div className="border-b border-destructive/30 bg-destructive/5 px-6 py-2 text-sm text-destructive">
        <div className="flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!loading || hasPanel) return null

  return (
    <div className="border-b border-border bg-muted/50 px-6 py-2 text-sm text-muted-foreground">
      <span className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading panel data…
      </span>
    </div>
  )
}
