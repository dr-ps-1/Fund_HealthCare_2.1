"use client"

import { useCallback, useEffect, useState } from "react"
import { Send, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import {
  loadAssistantThread,
  saveAssistantThread,
  type StoredAssistantMessage,
} from "@/lib/clinical-assistant-session"
import {
  DEMO_SECONDARY_PATIENT_ID,
  DEMO_STAR_PATIENT_ID,
} from "@/lib/demo-patients"
import type { Patient } from "@/lib/types"
import { cn } from "@/lib/utils"

type AIChatMessage = StoredAssistantMessage

type AssistantMode = "groq" | "mock" | "unknown"

type GroqStatus = {
  configured: boolean
  reason?: string
  hint?: string
  model?: string
}

interface AIChatProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
}

function starterPromptsFor(patient: Patient): string[] {
  if (patient.id === DEMO_STAR_PATIENT_ID) {
    return [
      "What's the plan for her home BP at 152/88 and RPM alerts?",
      "Summarize active alerts — what should we address first?",
    ]
  }
  if (patient.id === DEMO_SECONDARY_PATIENT_ID) {
    return [
      "What's the plan for her HbA1c at 9.2%?",
      "Summarize active alerts — what should we address first?",
    ]
  }
  return [
    `What's the plan for ${patient.keyMetric}?`,
    "Summarize active alerts — what should we address first?",
  ]
}

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function welcomeMessage(clinicianName: string, patientName: string): AIChatMessage {
  return {
    id: "ai-welcome",
    content: `Hello, ${clinicianName}. I can help you think through ${patientName}'s chart — meds, alerts, labs, and visit planning. I use the same context as the pre-visit brief, not patient chat messages.`,
    isFromAI: true,
    time: formatTime(),
  }
}

/** Show badge only when demo / misconfiguration — not when live AI is working. */
function warningBadge(
  mode: AssistantMode,
  groqStatus: GroqStatus | null
): { label: string; className: string } | null {
  if (mode === "groq" || (mode === "unknown" && groqStatus?.configured)) {
    return null
  }
  if (groqStatus?.reason === "placeholder") {
    return {
      label: "Demo — fix API key",
      className: "bg-amber-500/15 text-amber-800 dark:text-amber-400",
    }
  }
  return {
    label: "Demo mode",
    className: "bg-muted text-muted-foreground",
  }
}

function toApiHistory(messages: AIChatMessage[]) {
  return messages
    .filter((message) => message.id !== "ai-welcome")
    .map((message) => ({
      role: message.isFromAI ? ("assistant" as const) : ("user" as const),
      content: message.content,
    }))
}

export function AIChat({ patient, isOpen, onClose }: AIChatProps) {
  const { clinician } = useClinicianData()
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assistantMode, setAssistantMode] = useState<AssistantMode>("unknown")
  const [groqStatus, setGroqStatus] = useState<GroqStatus | null>(null)
  const [groqWarning, setGroqWarning] = useState<string | null>(null)

  useCloseOnRouteChange(onClose, isOpen)

  useEffect(() => {
    if (!isOpen) return

    const stored = loadAssistantThread(patient.id)
    if (stored.length > 0) {
      setMessages(stored)
      setHasStarted(stored.some((message) => !message.isFromAI))
    } else {
      setMessages([welcomeMessage(clinician.name, patient.name)])
      setHasStarted(false)
    }

    setError(null)
    setGroqWarning(null)
    setAssistantMode("unknown")

    void fetch("/api/ai/assistant")
      .then((res) => res.json())
      .then(
        (data: {
          groqConfigured?: boolean
          groqReason?: string
          groqHint?: string
          groqModel?: string
        }) => {
          const status = {
            configured: Boolean(data.groqConfigured),
            reason: data.groqReason,
            hint: data.groqHint,
            model: data.groqModel,
          }
          setGroqStatus(status)
          if (!status.configured && status.hint) {
            setGroqWarning(status.hint)
          }
        }
      )
      .catch(() => {
        setGroqStatus(null)
      })
  }, [isOpen, patient.id, patient.name, clinician.name])

  useEffect(() => {
    if (!isOpen || messages.length === 0) return
    saveAssistantThread(patient.id, messages)
  }, [isOpen, messages, patient.id])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      setHasStarted(true)

      const userMessage: AIChatMessage = {
        id: `user-${Date.now()}`,
        content: trimmed,
        isFromAI: false,
        time: formatTime(),
      }

      const historyBeforeSend = [...messages, userMessage]
      setMessages(historyBeforeSend)
      setNewMessage("")
      setIsTyping(true)
      setError(null)
      if (groqStatus?.configured) {
        setGroqWarning(null)
      }

      try {
        const response = await fetch("/api/ai/clinician-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: patient.id,
            message: trimmed,
            history: toApiHistory(messages),
          }),
        })
        const data = (await response.json()) as {
          reply?: string
          error?: string
          mode?: AssistantMode
          groqFallback?: boolean
          groqError?: string
          groqHint?: string
        }
        if (!response.ok || !data.reply) {
          throw new Error(data.error ?? "Assistant unavailable")
        }

        setAssistantMode(data.mode ?? "mock")
        if (data.groqFallback && data.groqError) {
          setGroqWarning(
            `Groq unavailable (${data.groqError.slice(0, 120)}). Showing demo reply.`
          )
        } else if (data.mode === "mock" && data.groqHint) {
          setGroqWarning(data.groqHint)
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            content: data.reply!,
            isFromAI: true,
            time: formatTime(),
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get response")
      } finally {
        setIsTyping(false)
      }
    },
    [groqStatus?.configured, isTyping, messages, patient.id]
  )

  const badge = warningBadge(assistantMode, groqStatus)
  const showStarters = !hasStarted && !isTyping

  if (!isOpen) return null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[600px] max-w-lg flex-col p-0" showCloseButton>
        <DialogHeader className="border-b border-border bg-primary/5 p-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Clinical assistant</p>
              <p className="text-sm font-normal text-muted-foreground">
                Chart context · {patient.name}
              </p>
            </div>
            {badge && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  badge.className
                )}
              >
                {badge.label}
              </span>
            )}
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  {message.isFromAI ? "Assistant" : "You"} · {message.time}
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
          {groqWarning && (
            <p className="mb-2 text-xs text-amber-700 dark:text-amber-400">
              {groqWarning}
            </p>
          )}
          {error && (
            <p className="mb-2 text-xs text-destructive">{error}</p>
          )}
          {showStarters && (
            <div className="mb-3 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Suggested questions:
              </p>
              <div className="flex flex-col gap-1.5">
                {starterPromptsFor(patient).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mb-2 text-xs text-muted-foreground">
            AI-generated decision support — not a substitute for clinical
            judgment. Verify before action.
          </p>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask about this patient..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void sendMessage(newMessage)
              }}
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              size="icon"
              onClick={() => void sendMessage(newMessage)}
              disabled={!newMessage.trim() || isTyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
