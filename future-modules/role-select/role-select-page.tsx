"use client"

import { useRouter } from "next/navigation"
import {
  Building2,
  HeartPulse,
  Landmark,
  Shield,
  Stethoscope,
} from "lucide-react"
import { DemoModeButton } from "@/components/demo/demo-mode-button"
import { Card, CardContent } from "@/components/ui/card"
import { setDemoRole, type DemoRole, roleRoutes } from "@/lib/demo"
import {
  getVitaPatientUrl,
  goToVitaPatientPortal,
  isVitaPatientLinkEnabled,
} from "@/lib/vita-link"
import { cn } from "@/lib/utils"

const roles: {
  id: DemoRole
  title: string
  subtitle: string
  module: string
  icon: typeof HeartPulse
}[] = [
  {
    id: "patient",
    title: "Patient",
    subtitle: isVitaPatientLinkEnabled()
      ? "Vita AI portal — dashboard, profile, devices, AI chat"
      : "Health Score, risks, visit verification, AI assistant",
    module: "1.1",
    icon: HeartPulse,
  },
  {
    id: "doctor",
    title: "Doctor",
    subtitle: "Panel triage, red flags, Pre-visit Brief",
    module: "2.1",
    icon: Stethoscope,
  },
  {
    id: "employer",
    title: "Employer",
    subtitle: "Team health mix, spend forecast, program ROI",
    module: "4.1",
    icon: Building2,
  },
  {
    id: "insurance",
    title: "Insurance",
    subtitle: "Portfolio risk, segmentation, early detection",
    module: "3.1 · 3.4",
    icon: Shield,
  },
  {
    id: "government",
    title: "Government",
    subtitle: "Florida ZIP risk zones, Medicaid budget forecast",
    module: "5.1",
    icon: Landmark,
  },
]

/** Shelved role picker. Product entry is `/login` → doctor workspace. */
export function FutureRoleSelectPage() {
  const router = useRouter()

  function enterRole(role: DemoRole) {
    setDemoRole(role)
    if (role === "patient" && getVitaPatientUrl()) {
      goToVitaPatientPortal()
      return
    }
    router.push(roleRoutes[role])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-4 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">iHealth Platform</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              One platform. Five views of health.
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Shelved role switcher. Clinician app starts at login. Use this
              screen later when Patient / Employer / Insurance / Government
              blocks are wired back in.
            </p>
          </div>
          <DemoModeButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => enterRole(role.id)}
              className="text-left"
            >
              <Card
                className={cn(
                  "h-full transition-colors hover:border-primary hover:bg-primary/5",
                  role.id === "doctor" && "border-primary/40"
                )}
              >
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <role.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Module {role.module}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {role.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {role.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Default product path: /login → /doctor · this page is /future/roles
        </p>
      </div>
    </div>
  )
}
