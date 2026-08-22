"use client"

import Link from "next/link"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { computePanelTrendSignals } from "@/lib/panel-trend-signals"
import { cn } from "@/lib/utils"

export function PanelSignalsWidget() {
  const { patients, alerts } = useClinicianData()
  const signals = computePanelTrendSignals(patients, alerts)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">Panel trends</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          Cohort patterns across your attributed panel
        </p>
        {signals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No cohort signals — panel metrics within target.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {signals.map((signal) => (
              <Link
                key={signal.id}
                href={signal.href}
                className="flex items-start gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    signal.severity === "high"
                      ? "bg-destructive"
                      : "bg-[#F59E0B]"
                  )}
                  aria-hidden
                />
                <span className="text-foreground">{signal.text}</span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
