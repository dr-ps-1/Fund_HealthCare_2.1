"use client"

import Link from "next/link"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { computePanelQualityMetrics } from "@/lib/panel-quality-metrics"
import { cn } from "@/lib/utils"

const statusBarClass = {
  "on-track": "bg-[#16A34A]",
  "needs-attention": "bg-[#F59E0B]",
  critical: "bg-destructive",
} as const

export function PanelQualityStrip({ className }: { className?: string }) {
  const { patients } = useClinicianData()
  const metrics = computePanelQualityMetrics(patients)

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/30 px-4 py-3",
        className
      )}
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Panel quality · attribution period
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Link
            key={metric.id}
            href={metric.href}
            className="group rounded-md px-1 py-0.5 transition-colors hover:bg-background/80"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-foreground group-hover:text-primary">
                {metric.label}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  metric.status === "critical" && "text-destructive",
                  metric.status === "needs-attention" && "text-[#B45309]",
                  metric.status === "on-track" && "text-[#15803D]"
                )}
              >
                {metric.valuePercent}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  statusBarClass[metric.status]
                )}
                style={{ width: `${metric.valuePercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
