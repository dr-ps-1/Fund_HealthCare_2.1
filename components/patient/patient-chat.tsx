"use client"

import { useEffect, useState } from "react"
import { Send, X } from "lucide-react"
import { PatientMessageAvatar } from "@/components/messages/patient-message-avatar"
import { useClinicianMessages } from "@/components/providers/clinician-messages-provider"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Patient } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PatientChatProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
}

export function PatientChat({ patient, isOpen, onClose }: PatientChatProps) {
  const { clinician } = useClinicianData()
  const { getMessagesForPatient, sendMessage, markThreadRead } =
    useClinicianMessages()
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  const messages = getMessagesForPatient(patient.id)

  useCloseOnRouteChange(onClose, isOpen)

  useEffect(() => {
    if (isOpen) {
      void markThreadRead(patient.id)
    }
  }, [isOpen, patient.id, markThreadRead])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      await sendMessage(patient.id, newMessage.trim())
      setNewMessage("")
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-[600px] max-w-lg flex-col p-0"
        showCloseButton={false}
      >
        <DialogHeader className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <PatientMessageAvatar name={patient.name} photo={patient.photo} />
              <div>
                <p className="font-semibold">{patient.name}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {patient.condition}
                </p>
              </div>
            </DialogTitle>
            <Button type="button" variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No messages yet. Start the conversation below.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex max-w-[80%] flex-col gap-1",
                    message.isFromDoctor ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <span className="text-xs text-muted-foreground">
                    {message.isFromDoctor ? clinician.name : message.patientName}
                  </span>
                  <div
                    className={cn(
                      "rounded-xl px-4 py-2",
                      message.isFromDoctor
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{message.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleSend()}
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => void handleSend()}
              disabled={!newMessage.trim() || sending}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
