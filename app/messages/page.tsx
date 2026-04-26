"use client"

import { useState } from "react"
import { Send, Paperclip, User } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { messages as initialMessages, patients } from "@/lib/mock-data"
import type { Message } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Conversation {
  patientId: string
  patientName: string
  patientPhoto: string
  lastMessage: string
  lastTime: string
  unread: boolean
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")

  const conversations: Conversation[] = patients.slice(0, 4).map((patient) => {
    const patientMessages = messages.filter((m) => m.patientId === patient.id)
    const lastMsg = patientMessages[patientMessages.length - 1]

    return {
      patientId: patient.id,
      patientName: patient.name,
      patientPhoto: patient.photo,
      lastMessage: lastMsg?.content || "No messages yet",
      lastTime: lastMsg?.time || "",
      unread: !lastMsg?.isFromDoctor,
    }
  })

  const activeConversation = conversations.find(
    (c) => c.patientId === selectedConversation
  )
  const activeMessages = messages.filter(
    (m) => m.patientId === selectedConversation
  )

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const patient = patients.find((p) => p.id === selectedConversation)
    if (!patient) return

    const message: Message = {
      id: `m-${Date.now()}`,
      patientId: selectedConversation,
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
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your patients
          </p>
        </div>

        <Card className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
          {/* Conversation List */}
          <div className="w-80 shrink-0 border-r border-border">
            <div className="border-b border-border p-4">
              <h2 className="font-semibold text-foreground">Conversations</h2>
            </div>
            <div className="overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.patientId}
                  onClick={() => setSelectedConversation(conversation.patientId)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors hover:bg-muted",
                    selectedConversation === conversation.patientId && "bg-muted"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">
                        {conversation.patientName}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastTime}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unread && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col">
            {activeConversation ? (
              <>
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {activeConversation.patientName}
                    </p>
                    <p className="text-sm text-muted-foreground">Patient</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col gap-4">
                    {activeMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex max-w-[70%] flex-col gap-1",
                          message.isFromDoctor
                            ? "ml-auto items-end"
                            : "items-start"
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
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
