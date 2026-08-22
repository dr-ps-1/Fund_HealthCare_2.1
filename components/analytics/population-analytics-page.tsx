"use client"

import { useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PanelQualityStrip } from "@/components/dashboard/panel-quality-strip"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import {
  computePanelAnalyticsSummary,
  computePanelConditionDistribution,
  computePanelStatusDistribution,
  computeRpmAnalyticsSummary,
  getAttributionPeriodLabel,
} from "@/lib/panel-analytics"
import { computePanelTrendRows } from "@/lib/panel-trends"
import { cn } from "@/lib/utils"

type MetricItem = {
  label: string
  value: string | number
  href?: string
  emphasis?: boolean
  warn?: boolean
}

export function PopulationAnalyticsPage() {
  return (
    <AppShell>
      <PopulationAnalyticsContent />
    </AppShell>
  )
}

function PopulationAnalyticsContent() {
  const { patients, alerts } = useClinicianData()
  const attributionPeriod = getAttributionPeriodLabel()

  const summary = useMemo(
    () => computePanelAnalyticsSummary(patients, alerts),
    [patients, alerts]
  )
  const conditions = useMemo(
    () =>
      [...computePanelConditionDistribution(patients)].sort(
        (a, b) => b.count - a.count
      ),
    [patients]
  )
  const statusSlices = useMemo(
    () => computePanelStatusDistribution(patients),
    [patients]
  )
  const rpm = useMemo(
    () => computeRpmAnalyticsSummary(patients, alerts),
    [patients, alerts]
  )
  const trends = useMemo(
    () => computePanelTrendRows(patients, alerts),
    [patients, alerts]
  )

  const metrics: MetricItem[] = [
    { label: "Panel", value: summary.panelSize, href: "/patients" },
    {
      label: "Urgent",
      value: summary.urgent,
      href: "/patients?filter=urgent",
      emphasis: summary.urgent > 0,
    },
    { label: "A1c goal", value: `${summary.a1cAtGoal}%`, href: "/patients?status=red" },
    { label: "BP control", value: `${summary.bpControl}%`, href: "/patients?filter=rpm" },
    {
      label: "RPM enrolled",
      value: summary.rpmEnrolled,
      href: rpm.href,
    },
    {
      label: "RPM alerts",
      value: rpm.withActiveVitalsAlert,
      href: "/alerts?tab=alerts&type=vitals",
      warn: rpm.withActiveVitalsAlert > 0,
    },
  ]

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Population analytics"
        description={`${attributionPeriod} · attributed panel snapshot`}
      />

      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
        {metrics.map((metric, index) => (
          <span key={metric.label} className="inline-flex items-center">
            {index > 0 && (
              <span className="mx-2 text-border select-none" aria-hidden>
                ·
              </span>
            )}
            {metric.href ? (
              <Link
                href={metric.href}
                className={cn(
                  "inline-flex items-baseline gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-background hover:text-foreground",
                  (metric.emphasis || metric.warn) && "text-foreground"
                )}
              >
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    metric.emphasis && "text-destructive",
                    metric.warn && "text-destructive"
                  )}
                >
                  {metric.value}
                </span>
                <span className="text-muted-foreground">{metric.label}</span>
              </Link>
            ) : (
              <span className="inline-flex items-baseline gap-1 px-1.5 py-0.5">
                <span className="font-semibold tabular-nums">{metric.value}</span>
                <span className="text-muted-foreground">{metric.label}</span>
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusSlices.map((slice) => (
          <Link
            key={slice.name}
            href={slice.href}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm transition-colors hover:bg-muted/50"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: slice.color }}
              aria-hidden
            />
            <span className="font-medium tabular-nums">{slice.value}</span>
            <span className="text-muted-foreground">{slice.name}</span>
          </Link>
        ))}
        <span className="inline-flex items-center rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground">
          Avg risk {summary.avgRisk}
        </span>
      </div>

      <PanelQualityStrip />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attribution period trends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Demo snapshot vs prior week — derived from current panel state
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {trends.map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-border bg-muted/20 px-4 py-3"
            >
              <p className="text-sm font-medium text-foreground">{row.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {row.current}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Prior {row.prior} · {row.note}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Panel by condition</CardTitle>
          <p className="text-sm text-muted-foreground">
            Member count per primary condition — select to open filtered list
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {conditions.map((row) => (
              <li key={row.name}>
                <Link
                  href={row.href}
                  className="flex items-center justify-between gap-4 px-6 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium text-foreground">
                      {row.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {row.count} member{row.count === 1 ? "" : "s"}
                    </span>
                    <span className="text-xs text-primary">View →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        RPM sync: {rpm.deviceSyncLabel}. Trends compare demo snapshots for the
        current attribution period.
      </p>
    </div>
  )
}
