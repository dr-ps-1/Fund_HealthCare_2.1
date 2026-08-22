"use client"

import { ClinicianShell } from "@/components/layout/clinician-shell"
import { AuthGuard } from "@/components/auth/auth-guard"
import { ClinicianComplianceFooter } from "@/components/layout/clinician-compliance-footer"
import { ClinicianDataProvider } from "@/components/providers/clinician-data-provider"
import { ClinicianMessagesProvider } from "@/components/providers/clinician-messages-provider"
import { Toaster } from "@/components/ui/toaster"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AuthGuard>
      <ClinicianDataProvider>
        <ClinicianMessagesProvider>
          <ClinicianShell>
            {children}
            <ClinicianComplianceFooter />
            <Toaster />
          </ClinicianShell>
        </ClinicianMessagesProvider>
      </ClinicianDataProvider>
    </AuthGuard>
  )
}
