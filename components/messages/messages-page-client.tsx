"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Send,
  User,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { PatientMessageAvatar } from "@/components/messages/patient-message-avatar"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { useClinicianMessages } from "@/components/providers/clinician-messages-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClinicalStatusBadge } from "@/components/ui/clinical-status-badge"
import { isFullChartPatient } from "@/lib/demo-patients"
import { type MessageThread } from "@/lib/clinician-messages"
import { cn } from "@/lib/utils"

type ThreadFilter = "awaiting" | "all"

function defaultPatientId(
  threads: MessageThread[],
  patientParam: string | null
): string | null {
  if (patientParam) return patientParam
  return threads.find((t) => t.needsReply && !t.read)?.patientId ?? threads[0]?.patientId ?? null
}

export function MessagesPageClient() {
  return (
    <AppShell>
      <MessagesPageContent />
    </AppShell>
  )
}

function MessagesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientParam = searchParams.get("patient")

  const { patients, getPatientById, clinician } = useClinicianData()
  const {
    source,
    loading,
    error,
    threads,
    sendMessage,
    markThreadRead,
    getMessagesForPatient,
  } = useClinicianMessages()

  const [filter, setFilter] = useState<ThreadFilter>("awaiting")
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(patientParam))
  const [sending, setSending] = useState(false)

  const selectedConversation = patientParam

  useEffect(() => {
    if (loading || threads.length === 0 || patientParam) return
    const defaultId = defaultPatientId(threads, null)
    if (defaultId) {
      router.replace(`/messages?patient=${defaultId}`, { scroll: false })
    }
  }, [patientParam, loading, threads, router])

  useEffect(() => {
    if (!patientParam) return
    setMobileShowThread(true)
    void markThreadRead(patientParam)
  }, [patientParam, markThreadRead])

  useEffect(() => {
    setNewMessage("")
  }, [selectedConversation])

  const activePatient = selectedConversation
    ? getPatientById(selectedConversation)
    : undefined

  const activeConversation = useMemo(() => {
    if (!selectedConversation) return undefined
    const existing = threads.find((t) => t.patientId === selectedConversation)
    if (existing) return existing
    if (!activePatient) return undefined
    return {
      patientId: activePatient.id,
      patientName: activePatient.name,
      patientPhoto: activePatient.photo,
      condition: activePatient.condition,
      keyMetric: activePatient.keyMetric,
      status: activePatient.status,
      lastMessage: "",
      lastTime: "",
      needsReply: false,
      read: true,
      href: `/messages?patient=${activePatient.id}`,
      rpm: activePatient.id === "9",
    } satisfies MessageThread
  }, [selectedConversation, threads, activePatient])

  const activeMessages = selectedConversation
    ? getMessagesForPatient(selectedConversation)
    : []

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return threads.filter((thread) => {
      if (filter === "awaiting" && (!thread.needsReply || thread.read)) {
        return false
      }
      if (!query) return true
      return (
        thread.patientName.toLowerCase().includes(query) ||
        thread.condition.toLowerCase().includes(query) ||
        thread.lastMessage.toLowerCase().includes(query)
      )
    })
  }, [threads, filter, searchQuery])

  const awaitingCount = threads.filter((t) => t.needsReply && !t.read).length

  const composeCandidates = useMemo(
    () =>
      patients
        .filter((p) => isFullChartPatient(p.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [patients]
  )

  const openConversation = useCallback(
    (patientId: string) => {
      setMobileShowThread(true)
      router.replace(`/messages?patient=${patientId}`, { scroll: false })
    },
    [router]
  )

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return
    setSending(true)
    try {
      await sendMessage(selectedConversation, newMessage.trim())
      setNewMessage("")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Secure HIPAA-aware messaging with patients on your attributed panel"
      >
        <p className="text-sm text-muted-foreground">
          {awaitingCount} awaiting reply · {threads.length} threads
        </p>
      </PageHeader>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
          Loading messages…
        </div>
      ) : (
        <div className="flex h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div
            className={cn(
              "flex w-full shrink-0 flex-col border-r border-border md:w-80 lg:w-96",
              mobileShowThread && selectedConversation ? "hidden md:flex" : "flex"
            )}
          >
            <div className="space-y-3 border-b border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-foreground">Conversations</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" size="sm" variant="outline">
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-72 w-64 overflow-y-auto">
                    <DropdownMenuLabel>Message a patient</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {composeCandidates.map((patient) => (
                      <DropdownMenuItem
                        key={patient.id}
                        onSelect={() => openConversation(patient.id)}
                      >
                        <span className="font-medium">{patient.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {patient.condition}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients or messages…"
                  className="pl-9"
                />
              </div>

              <div className="flex gap-1 rounded-lg bg-muted p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={filter === "awaiting" ? "secondary" : "ghost"}
                  className="h-8 flex-1"
                  onClick={() => setFilter("awaiting")}
                >
                  Awaiting
                  {awaitingCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                      {awaitingCount}
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={filter === "all" ? "secondary" : "ghost"}
                  className="h-8 flex-1"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {filter === "awaiting"
                    ? "No messages awaiting reply"
                    : "No conversations match your search"}
                </p>
              ) : (
                filteredThreads.map((conversation) => (
                  <button
                    key={conversation.patientId}
                    type="button"
                    onClick={() => openConversation(conversation.patientId)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors hover:bg-muted/50",
                      selectedConversation === conversation.patientId && "bg-muted"
                    )}
                  >
                    <PatientMessageAvatar
                      name={conversation.patientName}
                      photo={conversation.patientPhoto}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">
                          {conversation.patientName}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {conversation.lastTime}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          {conversation.condition}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {conversation.keyMetric}
                        </span>
                        {conversation.rpm && (
                          <Badge variant="outline" className="text-[10px]">
                            RPM
                          </Badge>
                        )}
                      </div>
                      <p
                        className="mt-1 line-clamp-2 text-sm text-muted-foreground"
                        title={conversation.lastMessage}
                      >
                        {conversation.lastMessage}
                      </p>
                      {conversation.needsReply && !conversation.read && (
                        <p className="mt-1 text-xs font-medium text-primary">
                          Awaiting your reply
                        </p>
                      )}
                    </div>
                    {conversation.needsReply && !conversation.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col",
              mobileShowThread ? "flex" : "hidden md:flex"
            )}
          >
            {activeConversation && selectedConversation ? (
              <div key={selectedConversation} className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setMobileShowThread(false)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <PatientMessageAvatar
                      name={activeConversation.patientName}
                      photo={activeConversation.patientPhoto}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {activeConversation.patientName}
                        </p>
                        <ClinicalStatusBadge status={activeConversation.status} />
                        {activeConversation.rpm && (
                          <Badge variant="outline" className="text-[10px]">
                            RPM
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activeConversation.condition} · {activeConversation.keyMetric}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isFullChartPatient(selectedConversation) && (
                      <Link href={`/patients/${selectedConversation}?brief=1`}>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-1.5 h-3.5 w-3.5" />
                          Brief
                        </Button>
                      </Link>
                    )}
                    <Link href={`/patients/${selectedConversation}`}>
                      <Button size="sm" variant="outline">
                        Chart
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
                  <div className="mx-auto flex max-w-2xl flex-col gap-4">
                    {activeMessages.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">
                        No messages yet. Send the first secure message below.
                      </p>
                    ) : (
                      activeMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex max-w-[85%] flex-col gap-1",
                            message.isFromDoctor
                              ? "ml-auto items-end"
                              : "items-start"
                          )}
                        >
                          <span className="px-1 text-xs font-medium text-muted-foreground">
                            {message.isFromDoctor
                              ? clinician.name
                              : message.patientName}
                          </span>
                          <div
                            className={cn(
                              "rounded-xl px-4 py-3 shadow-sm",
                              message.isFromDoctor
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-card text-foreground"
                            )}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                          <span className="px-1 text-xs text-muted-foreground">
                            {message.time}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-border bg-card p-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Reply to {activePatient?.name ?? activeConversation.patientName}. Not for
                    emergencies (call 911).
                  </p>
                  <div className="flex items-end gap-2">
                    <Textarea
                      key={`reply-${selectedConversation}`}
                      placeholder={`Write a reply to ${activePatient?.name ?? activeConversation.patientName}…`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      className="min-h-[80px] flex-1 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          void handleSend()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      className="shrink-0"
                      onClick={() => void handleSend()}
                      disabled={!newMessage.trim() || sending}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sending ? "Sending…" : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">Select a conversation</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Choose a thread from the list or start a new message with a patient
                  on your panel.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const first = composeCandidates[0]
                    if (first) openConversation(first.id)
                  }}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New message
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {source === "mock" && (
        <p className="text-xs text-muted-foreground">
          Demo session — messages reset on refresh.
        </p>
      )}
    </div>
  )
}
