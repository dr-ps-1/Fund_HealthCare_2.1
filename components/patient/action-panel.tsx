"use client"

import { useMemo, useState } from "react"
import { Calendar, Pill, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  VisitTypeField,
  closeDialogSafely,
  type VisitType,
} from "@/components/patient/visit-type-field"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import { saveChartNoteAction } from "@/lib/save-chart-note-action"
import { findTimeConflict } from "@/lib/appointments-local"
import { toLocalDateIso } from "@/lib/calendar"
import { toast } from "@/hooks/use-toast"
import type { Patient } from "@/lib/types"

interface ActionPanelProps {
  patient: Patient
  onOpenAIChat: () => void
  scheduleDialogOpen?: boolean
  onScheduleDialogOpenChange?: (open: boolean) => void
}

function defaultVisitDate(): string {
  return toLocalDateIso()
}

function defaultVisitTime(): string {
  return "09:00"
}

export function ActionPanel({
  patient,
  onOpenAIChat,
  scheduleDialogOpen,
  onScheduleDialogOpenChange,
}: ActionPanelProps) {
  const { scheduleAppointment } = useClinicianData()
  const [internalScheduleOpen, setInternalScheduleOpen] = useState(false)
  const showScheduleModal = scheduleDialogOpen ?? internalScheduleOpen
  const setShowScheduleModal =
    onScheduleDialogOpenChange ?? setInternalScheduleOpen
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)
  const [visitDate, setVisitDate] = useState(defaultVisitDate)
  const [visitTime, setVisitTime] = useState(defaultVisitTime)
  const [visitType, setVisitType] = useState<VisitType>("follow-up")
  const [visitReason, setVisitReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [medication, setMedication] = useState("")
  const [dosage, setDosage] = useState("")
  const [treatmentNotes, setTreatmentNotes] = useState("")
  const [savingTreatment, setSavingTreatment] = useState(false)

  const conflict = useMemo(
    () =>
      visitDate && visitTime ? findTimeConflict(visitDate, visitTime) : null,
    [visitDate, visitTime]
  )

  useCloseOnRouteChange(() => {
    setShowTreatmentModal(false)
    setShowScheduleModal(false)
  }, showScheduleModal || showTreatmentModal)

  async function handleScheduleVisit() {
    if (!visitDate || !visitTime) {
      toast({
        title: "Missing fields",
        description: "Select a date and time for the visit.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await scheduleAppointment({
        patientId: patient.id,
        patientName: patient.name,
        appointmentDate: visitDate,
        appointmentTime: visitTime,
        visitType,
        reason: visitReason.trim() || undefined,
      })
      toast({
        title: conflict ? "Visit scheduled with overlap" : "Visit scheduled",
        description: conflict
          ? `${patient.name} overlaps ${conflict.patientName} at ${conflict.time}.`
          : visitDate === defaultVisitDate()
            ? `${patient.name} added to today's schedule.`
            : `${patient.name} scheduled for ${visitDate}.`,
      })
      setVisitReason("")
      closeDialogSafely(() => setShowScheduleModal(false))
    } catch (err) {
      toast({
        title: "Could not schedule visit",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveTreatment() {
    if (!medication.trim()) {
      toast({
        title: "Medication required",
        description: "Enter a medication name to document the change.",
        variant: "destructive",
      })
      return
    }

    const content = [
      `[Treatment change] ${medication.trim()}${dosage.trim() ? ` — ${dosage.trim()}` : ""}`,
      treatmentNotes.trim() || undefined,
    ]
      .filter(Boolean)
      .join("\n")

    setSavingTreatment(true)
    try {
      await saveChartNoteAction(patient.id, content)
      toast({
        title: "Treatment documented",
        description: "Saved to chart notes for this patient.",
      })
      setShowTreatmentModal(false)
      setMedication("")
      setDosage("")
      setTreatmentNotes("")
    } catch (err) {
      toast({
        title: "Could not save treatment",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setSavingTreatment(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Chart actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={() => setShowScheduleModal(true)} className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule visit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowTreatmentModal(true)}
            className="w-full justify-start"
          >
            <Pill className="mr-2 h-4 w-4" />
            Change treatment
          </Button>
          <Button
            variant="outline"
            onClick={onOpenAIChat}
            className="w-full justify-start"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Clinical assistant
            <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              AI
            </span>
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Schedule Visit for {patient.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="visit-date">Date</Label>
              <Input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="visit-time">Time</Label>
              <Input
                id="visit-time"
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
              />
            </div>
            {conflict && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                Overlaps {conflict.patientName} at {conflict.time}. You can still
                save — the slot will be flagged on the calendar.
              </p>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="visit-type">Visit Type</Label>
              <VisitTypeField
                id="visit-type"
                value={visitType}
                onChange={setVisitType}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="visit-reason">Reason (optional)</Label>
              <Textarea
                id="visit-reason"
                placeholder="e.g., T2DM follow-up, med reconciliation"
                rows={2}
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleScheduleVisit()} disabled={saving}>
              {saving ? "Scheduling…" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTreatmentModal} onOpenChange={setShowTreatmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Treatment for {patient.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="medication">Medication</Label>
              <Input
                id="medication"
                placeholder="Enter medication name"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 50mg twice daily"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional comments..."
                rows={3}
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTreatmentModal(false)}
              disabled={savingTreatment}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSaveTreatment()}
              disabled={savingTreatment}
            >
              {savingTreatment ? "Saving…" : "Save to chart notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
