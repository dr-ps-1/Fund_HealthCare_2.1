"use client"

import Link from "next/link"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { buildPanelRosterSearchParams, computePanelRosterStats } from "@/lib/panel-roster"
import { cn } from "@/lib/utils"

export function PanelRosterStatsStrip({ className }: { className?: string }) {
  const { patients } = useClinicianData()
  const stats = computePanelRosterStats(patients)

  const items = [
    { label: "Attributed", value: stats.total, filter: "all" as const },
    {
      label: "Urgent",
      value: stats.urgent,
      filter: "urgent" as const,
      emphasis: stats.urgent > 0,
    },
    {
      label: "Needs attention",
      value: stats.attention,
      filter: "attention" as const,
    },
    {
      label: "Overdue 60d+",
      value: stats.overdue,
      filter: "overdue" as const,
      emphasis: stats.overdue > 0,
    },
    {
      label: "RPM connected",
      value: stats.rpmConnected,
      filter: "rpm" as const,
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
            href={`/patients${buildPanelRosterSearchParams({ filter: item.filter })}`}
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
