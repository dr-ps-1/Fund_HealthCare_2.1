"use client"

import { useMemo, useState } from "react"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  VisitTypeField,
  closeDialogSafely,
  type VisitType,
} from "@/components/patient/visit-type-field"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import { findTimeConflict } from "@/lib/appointments-local"
import { toLocalDateIso } from "@/lib/calendar"
import { toast } from "@/hooks/use-toast"
import type { Patient } from "@/lib/types"

function defaultVisitDate(): string {
  return toLocalDateIso()
}

function defaultVisitTime(): string {
  return "09:00"
}

export function PanelOnlyActions({
  patient,
  scheduleDialogOpen,
  onScheduleDialogOpenChange,
}: {
  patient: Patient
  scheduleDialogOpen?: boolean
  onScheduleDialogOpenChange?: (open: boolean) => void
}) {
  const { scheduleAppointment } = useClinicianData()
  const [internalOpen, setInternalOpen] = useState(false)
  const showSchedule = scheduleDialogOpen ?? internalOpen
  const setShowSchedule = onScheduleDialogOpenChange ?? setInternalOpen
  const [visitDate, setVisitDate] = useState(defaultVisitDate)
  const [visitTime, setVisitTime] = useState(defaultVisitTime)
  const [visitType, setVisitType] = useState<VisitType>("follow-up")
  const [visitReason, setVisitReason] = useState("")
  const [saving, setSaving] = useState(false)

  const conflict = useMemo(
    () =>
      visitDate && visitTime ? findTimeConflict(visitDate, visitTime) : null,
    [visitDate, visitTime]
  )

  useCloseOnRouteChange(() => setShowSchedule(false), showSchedule)

  async function handleSchedule() {
    if (!visitDate || !visitTime) return
    setSaving(true)
    try {
      await scheduleAppointment({
        patientId: patient.id,
        patientName: patient.name,
        appointmentDate: visitDate,
        appointmentTime: visitTime,
        visitType,
        reason: visitReason.trim() || "Panel outreach visit",
      })
      toast({
        title: conflict ? "Visit scheduled with overlap" : "Visit scheduled",
        description: conflict
          ? `${patient.name} overlaps ${conflict.patientName} at ${conflict.time}.`
          : visitDate === defaultVisitDate()
            ? `${patient.name} added to today's schedule.`
            : `${patient.name} scheduled for ${visitDate}.`,
      })
      closeDialogSafely(() => setShowSchedule(false))
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

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Outreach</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            className="w-full justify-start"
            onClick={() => setShowSchedule(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule visit
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent onCloseAutoFocus={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Schedule visit — {patient.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="panel-visit-date">Date</Label>
              <Input
                id="panel-visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="panel-visit-time">Time</Label>
              <Input
                id="panel-visit-time"
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
              <Label htmlFor="panel-visit-type">Visit type</Label>
              <VisitTypeField
                id="panel-visit-type"
                value={visitType}
                onChange={setVisitType}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="panel-visit-reason">Reason</Label>
              <Textarea
                id="panel-visit-reason"
                rows={2}
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSchedule(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSchedule()} disabled={saving}>
              {saving ? "Scheduling…" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
