"use client"

import { PanelMetricsStrip } from "@/components/dashboard/panel-metrics-strip"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import {
  formatUsDateTime,
  getPinnedDemoDate,
  getTimeGreeting,
  isSameLocalDay,
} from "@/lib/demo-clock"
import { useWallClock } from "@/lib/use-wall-clock"

export function DoctorDashboardHeader() {
  const { clinician } = useClinicianData()
  const now = useWallClock()
  const pinnedDemo = getPinnedDemoDate()
  const showDemoAnchor =
    pinnedDemo !== null && !isSameLocalDay(pinnedDemo, now)

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">
        {getTimeGreeting(now)}, {clinician.name}
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
        Panel overview
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {clinician.specialization} · NPI {clinician.npi} ·{" "}
        {now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
        {" · "}
        {now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </p>
      {showDemoAnchor && pinnedDemo && (
        <p className="mt-1 text-xs text-muted-foreground">
          Panel metrics use demo data as of {formatUsDateTime(pinnedDemo)}
        </p>
      )}

      <PanelMetricsStrip className="mt-3" />
    </div>
  )
}
