"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import {
  buildAlertsWorkqueueSearchParams,
  computeAlertQueueStats,
} from "@/lib/alerts-workqueue"
import { cn } from "@/lib/utils"

export function AlertQueueStatsStrip({ className }: { className?: string }) {
  const { alerts, inbox } = useClinicianData()
  const stats = useMemo(
    () => computeAlertQueueStats(alerts, inbox),
    [alerts, inbox]
  )

  const items = [
    {
      label: "Active alerts",
      value: stats.activeAlerts,
      href: `/alerts${buildAlertsWorkqueueSearchParams({ tab: "alerts" })}`,
    },
    {
      label: "High severity",
      value: stats.highSeverity,
      href: `/alerts${buildAlertsWorkqueueSearchParams({
        tab: "alerts",
        filter: "high",
      })}`,
      emphasis: stats.highSeverity > 0,
    },
    {
      label: "Inbox tasks",
      value: stats.inboxTasks,
      href: `/alerts${buildAlertsWorkqueueSearchParams({ tab: "tasks" })}`,
    },
    {
      label: "Inbox urgent",
      value: stats.inboxUrgent,
      href: `/alerts${buildAlertsWorkqueueSearchParams({ tab: "tasks" })}`,
      emphasis: stats.inboxUrgent > 0,
    },
  ]

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-1 gap-y-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground",
        className
      )}
    >
      {items.map((item, index) => (
        <span key={item.label} className="inline-flex items-center">
          {index > 0 && (
            <span className="mx-2 text-border select-none" aria-hidden>
              ·
            </span>
          )}
          <Link
            href={item.href}
            className={cn(
              "inline-flex items-baseline gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-background hover:text-foreground",
              item.emphasis && "text-foreground"
            )}
          >
            <span
              className={cn(
                "font-semibold tabular-nums",
                item.emphasis && "text-destructive"
              )}
            >
              {item.value}
            </span>
            <span>{item.label}</span>
          </Link>
        </span>
      ))}
    </div>
  )
}
