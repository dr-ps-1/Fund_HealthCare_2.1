"use client"

import Link from "next/link"
import { AlertTriangle, Calendar, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClinicalStatusBadge } from "@/components/ui/clinical-status-badge"
import {
  DEMO_SECONDARY_PATIENT_ID,
  DEMO_STAR_PATIENT_ID,
} from "@/lib/demo-patients"
import type { Alert, Patient } from "@/lib/types"

export function PanelOnlyVisitPrep({
  patient,
  alerts,
  onScheduleVisit,
}: {
  patient: Patient
  alerts: Alert[]
  onScheduleVisit?: () => void
}) {
  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const topAlert = activeAlerts.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 }
    return rank[a.severity] - rank[b.severity]
  })[0]

  return (
    <Card id="visit-prep" className="scroll-mt-24 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Panel triage summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <ClinicalStatusBadge status={patient.status} />
          <span className="text-muted-foreground">
            Risk {patient.riskScore}/100 · {patient.daysSinceVisit}d since last visit
          </span>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-foreground">{patient.keyMetric}</p>
          <p className="text-muted-foreground">
            {patient.diagnosis} · Adherence {patient.adherenceScore}%
          </p>
          {patient.medications.length > 0 && (
            <p className="text-muted-foreground">
              Meds: {patient.medications.slice(0, 3).join("; ")}
              {patient.medications.length > 3 ? "…" : ""}
            </p>
          )}
        </div>

        {topAlert && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="flex items-center gap-1.5 font-medium text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {topAlert.headline}
            </p>
            <p className="mt-1 text-foreground">{topAlert.cause}</p>
            {topAlert.metric && (
              <p className="mt-0.5 text-muted-foreground">{topAlert.metric}</p>
            )}
          </div>
        )}

        {activeAlerts.length > 1 && (
          <p className="text-xs text-muted-foreground">
            +{activeAlerts.length - 1} more active alert
            {activeAlerts.length - 1 === 1 ? "" : "s"} in the sidebar
          </p>
        )}

        <p className="text-muted-foreground">
          Full visit prep (AI brief, timeline, RPM) is available for connected
          members with recent encounters or remote monitoring.
        </p>

        <div className="flex flex-wrap gap-2">
          {onScheduleVisit && (
            <Button size="sm" onClick={onScheduleVisit}>
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Schedule outreach
            </Button>
          )}
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/patients/${DEMO_STAR_PATIENT_ID}?brief=1`}>
              <ChevronRight className="mr-1.5 h-3.5 w-3.5" />
              Ava — RPM chart
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/patients/${DEMO_SECONDARY_PATIENT_ID}?brief=1`}>
              Sarah — full chart
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
