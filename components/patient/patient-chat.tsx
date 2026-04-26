"use client"

import { useState } from "react"
import { Send, Paperclip, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Patient, Message } from "@/lib/types"
import { messages as initialMessages } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface PatientChatProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
}

export function PatientChat({ patient, isOpen, onClose }: PatientChatProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.filter((m) => m.patientId === patient.id)
  )
  const [newMessage, setNewMessage] = useState("")

  const handleSend = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: `m-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientPhoto: patient.photo,
      content: newMessage,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      isFromDoctor: true,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[600px] max-w-lg flex-col p-0">
        <DialogHeader className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{patient.name}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {patient.condition}
                </p>
              </div>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[80%] flex-col gap-1",
                  message.isFromDoctor ? "ml-auto items-end" : "items-start"
                )}
              >
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
                <span className="text-xs text-muted-foreground">
                  {message.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
