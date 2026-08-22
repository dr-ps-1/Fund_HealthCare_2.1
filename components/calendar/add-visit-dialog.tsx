"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  DEMO_SECONDARY_PATIENT_ID,
  DEMO_STAR_PATIENT_ID,
} from "@/lib/demo-patients"
import { findTimeConflict } from "@/lib/appointments-local"
import { displayTimeToInput } from "@/lib/calendar"
import { toast } from "@/hooks/use-toast"
import type { TodayAppointment } from "@/lib/doctor-dashboard-data"
import type { Patient } from "@/lib/types"

function defaultVisitTime(): string {
  return "09:00"
}

function inferVisitType(appointment: TodayAppointment): VisitType {
  const text = `${appointment.type} ${appointment.location}`.toLowerCase()
  if (text.includes("telehealth")) return "telehealth"
  if (text.includes("follow-up") || text.includes("check-in")) return "follow-up"
  return "in-person"
}

function sortPatientsForPicker(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => {
    if (a.id === DEMO_STAR_PATIENT_ID) return -1
    if (b.id === DEMO_STAR_PATIENT_ID) return 1
    if (a.id === DEMO_SECONDARY_PATIENT_ID) return -1
    if (b.id === DEMO_SECONDARY_PATIENT_ID) return 1
    return a.name.localeCompare(b.name)
  })
}

export function AddVisitDialog({
  open,
  onOpenChange,
  defaultDate,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate: string
  editing?: TodayAppointment | null
}) {
  const { patients, scheduleAppointment, updateAppointment } = useClinicianData()
  const panel = useMemo(() => sortPatientsForPicker(patients), [patients])
  const [patientId, setPatientId] = useState(DEMO_STAR_PATIENT_ID)
  const [visitDate, setVisitDate] = useState(defaultDate)
  const [visitTime, setVisitTime] = useState(defaultVisitTime())
  const [visitType, setVisitType] = useState<VisitType>("follow-up")
  const [visitReason, setVisitReason] = useState("")
  const [saving, setSaving] = useState(false)

  useCloseOnRouteChange(() => onOpenChange(false), open)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setPatientId(editing.patientId)
      setVisitDate(editing.appointmentDate ?? defaultDate)
      setVisitTime(displayTimeToInput(editing.time))
      setVisitType(inferVisitType(editing))
      setVisitReason(editing.reason)
      return
    }
    setVisitDate(defaultDate)
    setVisitTime(defaultVisitTime)
    setVisitType("follow-up")
    setVisitReason("")
    setPatientId((current) =>
      panel.some((patient) => patient.id === current)
        ? current
        : (panel[0]?.id ?? DEMO_STAR_PATIENT_ID)
    )
  }, [open, defaultDate, panel, editing])

  const conflict = useMemo(
    () =>
      visitDate && visitTime
        ? findTimeConflict(visitDate, visitTime, editing?.id)
        : null,
    [visitDate, visitTime, editing?.id]
  )

  async function handleSchedule() {
    const patient =
      panel.find((item) => item.id === patientId) ??
      (editing
        ? {
            id: editing.patientId,
            name: editing.patientName,
          }
        : null)
    if (!patient || !visitDate || !visitTime) {
      toast({
        title: "Missing fields",
        description: "Select a patient, date, and time.",
        variant: "destructive",
      })
      return
    }

    const payload = {
      patientId: patient.id,
      patientName: patient.name,
      appointmentDate: visitDate,
      appointmentTime: visitTime,
      visitType,
      reason: visitReason.trim() || undefined,
    }

    setSaving(true)
    try {
      if (editing) {
        await updateAppointment(editing.id, payload)
        toast({
          title: conflict ? "Visit updated with overlap" : "Visit updated",
          description: conflict
            ? `${patient.name} overlaps ${conflict.patientName} at ${conflict.time}.`
            : `${patient.name} saved to ${visitDate}.`,
        })
      } else {
        await scheduleAppointment(payload)
        toast({
          title: conflict ? "Visit scheduled with overlap" : "Visit scheduled",
          description: conflict
            ? `${patient.name} overlaps ${conflict.patientName} at ${conflict.time}.`
            : `${patient.name} added to the calendar.`,
        })
      }
      setVisitReason("")
      closeDialogSafely(() => onOpenChange(false))
    } catch (err) {
      toast({
        title: editing ? "Could not update visit" : "Could not schedule visit",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const isEditing = Boolean(editing)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onCloseAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Reschedule visit" : "Add visit"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="calendar-patient">Patient</Label>
            <select
              id="calendar-patient"
              value={patientId}
              disabled={isEditing}
              onChange={(event) => setPatientId(event.target.value)}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-60"
            >
              {panel.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                  {patient.id === DEMO_STAR_PATIENT_ID ? " · RPM" : ""}
                </option>
              ))}
              {editing &&
                !panel.some((patient) => patient.id === editing.patientId) && (
                  <option value={editing.patientId}>{editing.patientName}</option>
                )}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="calendar-visit-date">Date</Label>
            <Input
              id="calendar-visit-date"
              type="date"
              value={visitDate}
              onChange={(event) => setVisitDate(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="calendar-visit-time">Time</Label>
            <Input
              id="calendar-visit-time"
              type="time"
              value={visitTime}
              onChange={(event) => setVisitTime(event.target.value)}
            />
          </div>
          {conflict && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Overlaps {conflict.patientName} at {conflict.time}. You can still
              save — the slot will be flagged on the calendar.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="calendar-visit-type">Visit type</Label>
            <VisitTypeField
              id="calendar-visit-type"
              value={visitType}
              onChange={setVisitType}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="calendar-visit-reason">Reason (optional)</Label>
            <Textarea
              id="calendar-visit-reason"
              placeholder="e.g., RPM follow-up, med reconciliation"
              rows={2}
              value={visitReason}
              onChange={(event) => setVisitReason(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={() => void handleSchedule()} disabled={saving}>
            <Calendar className="mr-2 h-4 w-4" />
            {saving
              ? isEditing
                ? "Saving…"
                : "Scheduling…"
              : isEditing
                ? "Save changes"
                : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
