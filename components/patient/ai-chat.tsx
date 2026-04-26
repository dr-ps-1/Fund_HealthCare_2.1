"use client"

import { useState } from "react"
import { Send, Sparkles, User } from "lucide-react"
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

interface AIChatMessage {
  id: string
  content: string
  isFromAI: boolean
  time: string
}

interface AIChatProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
}

const aiResponses = [
  "Based on the patient's recent vitals and medication adherence patterns, I recommend monitoring blood pressure more frequently over the next 48 hours. The recent spike may be correlated with missed medication doses.",
  "Looking at the patient's history, there's a pattern of elevated BP readings in the morning. Consider adjusting medication timing to evening administration.",
  "The data suggests the patient may benefit from lifestyle modifications. Current activity levels are 40% below recommended for their condition.",
]

export function AIChat({ patient, isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "ai-1",
      content: `Hello, Dr. Wilson. I'm ready to assist with questions about ${patient.name}'s care. What would you like to know?`,
      isFromAI: true,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!newMessage.trim()) return

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      content: newMessage,
      isFromAI: false,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    setTimeout(() => {
      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isFromAI: true,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[600px] max-w-lg flex-col p-0">
        <DialogHeader className="border-b border-border bg-primary/5 p-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">AI Assistant</p>
              <p className="text-sm font-normal text-muted-foreground">
                Analyzing {patient.name}&apos;s data
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[85%] flex-col gap-1",
                  !message.isFromAI ? "ml-auto items-end" : "items-start"
                )}
              >
                <div className="flex items-start gap-2">
                  {message.isFromAI && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-xl px-4 py-2",
                      message.isFromAI
                        ? "bg-primary/10 text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {!message.isFromAI && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs text-muted-foreground",
                    message.isFromAI ? "ml-10" : "mr-10"
                  )}
                >
                  {message.time}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-xl bg-primary/10 px-4 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask about this patient..."
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
