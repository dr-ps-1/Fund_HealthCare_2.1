"use client"

import { useClinicianData } from "@/components/providers/clinician-data-provider"

export function ClinicianComplianceFooter() {
  const { source } = useClinicianData()
  const isDemo = source === "mock"

  return (
    <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
      <p>
        HIPAA-aware clinician workflow
        {isDemo ? " (demonstration environment)" : ""}. Protected health
        information shown for triage purposes only.
      </p>
      {isDemo && (
        <p className="mt-1">
          Not for clinical use · Demo data · US ambulatory panel context
        </p>
      )}
    </footer>
  )
}
