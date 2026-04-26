"use client"

import { useState } from "react"
import { Calendar, Pill, MessageSquare, Sparkles } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Patient } from "@/lib/types"

interface ActionPanelProps {
  patient: Patient
  onOpenChat: () => void
  onOpenAIChat: () => void
}

export function ActionPanel({ patient, onOpenChat, onOpenAIChat }: ActionPanelProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={() => setShowScheduleModal(true)} className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Visit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowTreatmentModal(true)}
            className="w-full justify-start"
          >
            <Pill className="mr-2 h-4 w-4" />
            Change Treatment
          </Button>
          <Button
            variant="outline"
            onClick={onOpenChat}
            className="w-full justify-start"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Patient
          </Button>
          <Button
            variant="secondary"
            onClick={onOpenAIChat}
            className="w-full justify-start"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Ask AI
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Visit for {patient.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="visit-date">Date</Label>
              <Input id="visit-date" type="date" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="visit-time">Time</Label>
              <Input id="visit-time" type="time" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="visit-type">Visit Type</Label>
              <Select>
                <SelectTrigger id="visit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="telehealth">Telehealth</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowScheduleModal(false)}>
              Schedule
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
              <Input id="medication" placeholder="Enter medication name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" placeholder="e.g., 50mg twice daily" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional comments..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTreatmentModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowTreatmentModal(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
