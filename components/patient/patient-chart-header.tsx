"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClinicalStatusBadge } from "@/components/ui/clinical-status-badge"
import type { Patient } from "@/lib/types"
import { formatUsDateNumeric, usTimezoneLabel } from "@/lib/demo-clock"
import { isFullChartPatient } from "@/lib/demo-patients"

export function PatientChartHeader({
  patient,
  onPreVisitBrief,
  onScheduleVisit,
}: {
  patient: Patient
  onPreVisitBrief?: () => void
  onScheduleVisit?: () => void
}) {
  const fullChart = isFullChartPatient(patient.id)
  const tz = usTimezoneLabel(patient.state)
  const lastVisitUs = formatUsDateNumeric(patient.lastVisitDate)

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex items-start gap-3">
        <Link href="/patients">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to panel</span>
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {patient.name}
            </h1>
            <ClinicalStatusBadge status={patient.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.dateOfBirth ? `DOB ${patient.dateOfBirth}` : `${patient.age}y`}
            {patient.dateOfBirth ? ` (${patient.age}y)` : ""}
            {" · "}
            {patient.diagnosis} · ICD-10 {patient.icdCodes.join(", ")}
          </p>
          <p className="text-sm text-muted-foreground">
            {[patient.city, patient.state, patient.zip].filter(Boolean).join(", ")}
            {" · "}
            MRN {100000 + Number(patient.id)}
            {" · "}
            Last visit {lastVisitUs} ({patient.daysSinceVisit}d) {tz !== "local" ? tz : ""}
          </p>
          {patient.insurancePayer && (
            <p className="text-sm text-muted-foreground">
              {patient.insurancePayer}
              {patient.insurancePlan ? ` · ${patient.insurancePlan}` : ""}
              {patient.memberId ? ` · Member ${patient.memberId}` : ""}
            </p>
          )}
        </div>
      </div>

      {fullChart && (
        <div className="flex flex-wrap gap-2 pl-12">
          <Button size="sm" onClick={onPreVisitBrief}>
            <FileText className="mr-2 h-4 w-4" />
            Pre-visit brief
          </Button>
          <Button size="sm" variant="outline" onClick={onScheduleVisit}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule visit
          </Button>
        </div>
      )}
    </div>
  )
}
