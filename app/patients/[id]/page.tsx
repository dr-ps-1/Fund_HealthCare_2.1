"use client"

import { useState } from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RiskScoreCircle } from "@/components/patient/risk-score-circle"
import { PatientTimeline } from "@/components/patient/patient-timeline"
import { AISummaryCard } from "@/components/patient/ai-summary-card"
import { PatientAlertsCard } from "@/components/patient/patient-alerts-card"
import { ActionPanel } from "@/components/patient/action-panel"
import { AIRecommendationsPanel } from "@/components/patient/ai-recommendations-panel"
import { PatientChat } from "@/components/patient/patient-chat"
import { AIChat } from "@/components/patient/ai-chat"
import { DoctorNotes } from "@/components/patient/doctor-notes"
import { UploadData } from "@/components/patient/upload-data"
import {
  patients,
  alerts,
  timelineEvents,
  aiSummaries,
  aiRecommendations,
} from "@/lib/mock-data"
import type { PatientStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

function StatusBadge({ status }: { status: PatientStatus }) {
  const labels = {
    green: "Stable",
    yellow: "Caution",
    red: "Critical",
  }

  return (
    <Badge
      className={cn(
        "text-white",
        status === "green" && "bg-[#16A34A] hover:bg-[#16A34A]",
        status === "yellow" && "bg-[#F59E0B] hover:bg-[#F59E0B]",
        status === "red" && "bg-destructive hover:bg-destructive"
      )}
    >
      {labels[status]}
    </Badge>
  )
}

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  const patient = patients.find((p) => p.id === id)

  if (!patient) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">Patient not found</p>
          <Link href="/patients">
            <Button variant="link">Back to Patients</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const patientAlerts = alerts.filter((a) => a.patientId === id)
  const patientEvents = timelineEvents.filter((e) => e.patientId === id)
  const patientSummary = aiSummaries[id]
  const patientRecommendations = aiRecommendations.filter(
    (r) => r.patientId === id
  )

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Patient Profile
            </h1>
            <p className="text-muted-foreground">
              View and manage patient information
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          {/* Left Column - Patient Info */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col items-center p-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  {patient.name}
                </h2>
                <p className="text-muted-foreground">{patient.age} years old</p>
                <div className="mt-2">
                  <StatusBadge status={patient.status} />
                </div>
                <div className="mt-4 w-full border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="font-medium text-foreground">
                    {patient.diagnosis}
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  <RiskScoreCircle score={patient.riskScore} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Timeline */}
          <div className="flex flex-col gap-6">
            {patientRecommendations.length > 0 && (
              <AIRecommendationsPanel recommendations={patientRecommendations} />
            )}
            <PatientTimeline events={patientEvents} />
          </div>

          {/* Right Column - AI Summary, Alerts, Actions */}
          <div className="flex flex-col gap-4">
            <AISummaryCard summary={patientSummary} />
            <PatientAlertsCard alerts={patientAlerts} />
            <ActionPanel
              patient={patient}
              onOpenChat={() => setIsChatOpen(true)}
              onOpenAIChat={() => setIsAIChatOpen(true)}
            />
            <DoctorNotes patientId={patient.id} />
            <UploadData patientId={patient.id} />
          </div>
        </div>
      </div>

      <PatientChat
        patient={patient}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      <AIChat
        patient={patient}
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </AppShell>
  )
}
