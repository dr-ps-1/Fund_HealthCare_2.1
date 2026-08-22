"use client"

import { AppLink } from "@/components/ui/app-link"
import { useMemo } from "react"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { cn } from "@/lib/utils"

type MetricLink = {
  label: string
  value: number
  href: string
  emphasis?: boolean
  title?: string
}

export function PanelMetricsStrip({ className }: { className?: string }) {
  const { patients, alerts, inbox } = useClinicianData()

  const stats = useMemo(
    () => ({
      totalPatients: patients.length,
      highRiskPatients: patients.filter((p) => p.status === "red").length,
      activeAlerts: alerts.filter((alert) => alert.status === "active").length,
      overdueVisits: patients.filter((p) => p.daysSinceVisit >= 60).length,
    }),
    [patients, alerts]
  )

  const inboxUrgent = inbox.filter((item) => item.priority === "high").length

  const metrics: MetricLink[] = [
    {
      label: "Panel",
      value: stats.totalPatients,
      href: "/patients",
      title: "Total patients on your panel",
    },
    {
      label: "Urgent",
      value: stats.highRiskPatients,
      href: "/patients?filter=urgent",
      emphasis: stats.highRiskPatients > 0,
      title: "Patients flagged urgent (red status)",
    },
    {
      label: "Alerts",
      value: stats.activeAlerts,
      href: "/alerts?tab=alerts",
      emphasis: stats.activeAlerts > 0,
      title: "Active clinical alerts requiring review",
    },
    {
      label: "Urgent tasks",
      value: inboxUrgent,
      href: "/alerts?tab=tasks",
      emphasis: inboxUrgent > 0,
      title: "High-priority inbox tasks (not total inbox)",
    },
    {
      label: "Overdue (60d+)",
      value: stats.overdueVisits,
      href: "/patients?filter=overdue",
      emphasis: stats.overdueVisits > 0,
      title: "Patients without a visit in 60+ days",
    },
  ]

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-1 gap-y-2 text-sm text-muted-foreground",
        className
      )}
    >
      {metrics.map((metric, index) => (
        <span key={metric.label} className="inline-flex items-center">
          {index > 0 && (
            <span className="mx-2 text-border select-none" aria-hidden>
              ·
            </span>
          )}
          <AppLink
            href={metric.href}
            title={metric.title}
            className={cn(
              "inline-flex items-baseline gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted hover:text-foreground",
              metric.emphasis && "text-foreground"
            )}
          >
            <span
              className={cn(
                "font-semibold tabular-nums",
                metric.emphasis && "text-destructive"
              )}
            >
              {metric.value}
            </span>
            <span>{metric.label}</span>
          </AppLink>
        </span>
      ))}
    </div>
  )
}
