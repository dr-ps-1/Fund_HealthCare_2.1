"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskScoreCircle } from "@/components/patient/risk-score-circle"
import { PatientTimeline } from "@/components/patient/patient-timeline"
import { PatientAlertsCard } from "@/components/patient/patient-alerts-card"
import { ActionPanel } from "@/components/patient/action-panel"
import { AIChat } from "@/components/patient/ai-chat"
import { DoctorNotes } from "@/components/patient/doctor-notes"
import { UploadData } from "@/components/patient/upload-data"
import { PreVisitBriefCard } from "@/components/patient/pre-visit-brief"
import { PanelOnlyVisitPrep } from "@/components/patient/panel-only-visit-prep"
import { PanelOnlyCallout } from "@/components/patient/panel-only-callout"
import { PanelOnlyActions } from "@/components/patient/panel-only-actions"
import { PatientChartHeader } from "@/components/patient/patient-chart-header"
import { PatientChartVitalsStrip } from "@/components/patient/patient-chart-vitals-strip"
import { ClinicalStatusBadge } from "@/components/ui/clinical-status-badge"
import { aiRecommendations } from "@/lib/mock-data"
import { isFullChartPatient } from "@/lib/demo-patients"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

export function PatientProfileClient({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <PatientProfileContent params={params} />
}

function PatientProfileContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoBrief = searchParams.get("brief") === "1"
  const openSchedule = searchParams.get("schedule") === "1"
  const openAi = searchParams.get("ai") === "1"
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [briefTrigger, setBriefTrigger] = useState(0)

  const {
    getPatientById,
    alerts,
    getTimelineForPatient,
    getAiSummaryForPatient,
  } = useClinicianData()

  const patient = getPatientById(id)

  useCloseOnRouteChange(() => {
    setIsAIChatOpen(false)
    setScheduleOpen(false)
  })

  useEffect(() => {
    if (openSchedule) {
      setScheduleOpen(true)
    }
  }, [openSchedule])

  useEffect(() => {
    if (openAi) {
      setIsAIChatOpen(true)
    }
  }, [openAi])

  function handleAIChatClose() {
    setIsAIChatOpen(false)
    if (openAi) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("ai")
      const query = params.toString()
      router.replace(
        query ? `/patients/${id}?${query}` : `/patients/${id}`,
        { scroll: false }
      )
    }
  }

  function handleScheduleDialogChange(open: boolean) {
    setScheduleOpen(open)
    if (!open && openSchedule) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("schedule")
      const query = params.toString()
      router.replace(
        query ? `/patients/${id}?${query}` : `/patients/${id}`,
        { scroll: false }
      )
    }
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Patient not found</p>
        <Link href="/patients">
          <Button variant="link">Back to panel</Button>
        </Link>
      </div>
    )
  }

  const patientAlerts = alerts.filter((a) => a.patientId === id)
  const patientEvents = getTimelineForPatient(id)
  const patientSummary = getAiSummaryForPatient(id)
  const patientRecommendations = aiRecommendations.filter(
    (r) => r.patientId === id
  )
  const fullChart = isFullChartPatient(id)

  return (
    <>
      <div className="flex flex-col gap-6">
        <PatientChartHeader
          patient={patient}
          onPreVisitBrief={() => setBriefTrigger((value) => value + 1)}
          onScheduleVisit={() => setScheduleOpen(true)}
        />

        {!fullChart && <PanelOnlyCallout patientName={patient.name} />}

        {fullChart && <PatientChartVitalsStrip patient={patient} />}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Demographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <ClinicalStatusBadge status={patient.status} />
                <RiskScoreCircle score={patient.riskScore} />
              </div>
              <div className="space-y-3 border-t border-border pt-4 text-sm">
                {patient.dateOfBirth && (
                  <div>
                    <p className="text-muted-foreground">Date of birth</p>
                    <p className="font-medium text-foreground">
                      {patient.dateOfBirth} ({patient.age}y)
                    </p>
                  </div>
                )}
                {patient.insurancePayer && (
                  <div>
                    <p className="text-muted-foreground">Coverage</p>
                    <p className="font-medium text-foreground">
                      {patient.insurancePayer}
                    </p>
                    {patient.insurancePlan && (
                      <p className="text-muted-foreground">{patient.insurancePlan}</p>
                    )}
                    {patient.memberId && (
                      <p className="text-xs text-muted-foreground">
                        Member ID {patient.memberId}
                      </p>
                    )}
                  </div>
                )}
                {patient.lastAwvDate && (
                  <div>
                    <p className="text-muted-foreground">Last AWV</p>
                    <p className="font-medium text-foreground">{patient.lastAwvDate}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Key metric</p>
                  <p className="font-medium text-foreground">{patient.keyMetric}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Adherence</p>
                  <p className="font-medium text-foreground">
                    {patient.adherenceScore}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Medications</p>
                  <ul className="mt-1 space-y-1 text-foreground">
                    {patient.medications.map((med) => (
                      <li key={med}>{med}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-muted-foreground">Allergies</p>
                  <p className="font-medium text-foreground">
                    {patient.allergies.length
                      ? patient.allergies.join(", ")
                      : "NKDA"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            {fullChart ? (
              <PreVisitBriefCard
                patient={patient}
                summary={patientSummary}
                alerts={patientAlerts}
                panelRecommendations={patientRecommendations}
                autoGenerate={autoBrief}
                generateTrigger={briefTrigger}
                onScheduleVisit={() => setScheduleOpen(true)}
              />
            ) : (
              <PanelOnlyVisitPrep
                patient={patient}
                alerts={patientAlerts}
                onScheduleVisit={() => setScheduleOpen(true)}
              />
            )}
            {fullChart ? (
              <PatientTimeline events={patientEvents} patientId={patient.id} />
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <PatientAlertsCard alerts={patientAlerts} />
            {fullChart ? (
              <>
                <ActionPanel
                  patient={patient}
                  onOpenAIChat={() => setIsAIChatOpen(true)}
                  scheduleDialogOpen={scheduleOpen}
                  onScheduleDialogOpenChange={handleScheduleDialogChange}
                />
                <DoctorNotes patientId={patient.id} />
                <UploadData patientId={patient.id} />
              </>
            ) : (
              <PanelOnlyActions
                patient={patient}
                scheduleDialogOpen={scheduleOpen}
                onScheduleDialogOpenChange={handleScheduleDialogChange}
              />
            )}
          </div>
        </div>
      </div>

      <AIChat
        patient={patient}
        isOpen={isAIChatOpen && fullChart}
        onClose={handleAIChatClose}
      />
    </>
  )
}
