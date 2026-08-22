"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { isSupabaseMessagingEnabled } from "@/lib/config/public-env"
import {
  fetchClinicianMessages,
  markAllClinicianThreadsReadApi,
  markClinicianThreadReadApi,
  sendClinicianMessage,
} from "@/lib/clinician-messages-api"
import {
  buildMessageThreads,
  markAllMessageThreadsRead,
  markMessageThreadRead,
  type MessageThread,
} from "@/lib/clinician-messages"
import { messages as seedMessages } from "@/lib/mock-data"
import {
  loadMockClinicianMessages,
  saveMockClinicianMessages,
} from "@/lib/clinician-messages-local"
import type { Message } from "@/lib/types"

type ClinicianMessagesContextValue = {
  source: "mock" | "supabase" | "loading"
  loading: boolean
  error: string | null
  messages: Message[]
  readPatientIds: string[]
  threads: MessageThread[]
  unreadCount: number
  reload: () => Promise<void>
  sendMessage: (patientId: string, content: string) => Promise<Message | null>
  markThreadRead: (patientId: string) => Promise<void>
  markAllThreadsRead: () => Promise<void>
  getMessagesForPatient: (patientId: string) => Message[]
  bumpReadState: () => void
}

const ClinicianMessagesContext = createContext<ClinicianMessagesContextValue | null>(
  null
)

function notifyReadStateChanged() {
  window.dispatchEvent(new Event("clinician-messages-read"))
}

export function ClinicianMessagesProvider({ children }: { children: ReactNode }) {
  const { patients } = useClinicianData()
  const useSupabase = isSupabaseMessagingEnabled()

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return seedMessages
    return loadMockClinicianMessages() ?? seedMessages
  })
  const [readPatientIds, setReadPatientIds] = useState<string[]>([])
  const [source, setSource] = useState<"mock" | "supabase" | "loading">(
    useSupabase ? "loading" : "mock"
  )
  const [loading, setLoading] = useState(useSupabase)
  const [error, setError] = useState<string | null>(null)
  const [readVersion, setReadVersion] = useState(0)

  const bumpReadState = useCallback(() => {
    setReadVersion((v) => v + 1)
    notifyReadStateChanged()
  }, [])

  const reload = useCallback(async () => {
    if (!useSupabase) {
      setMessages(loadMockClinicianMessages() ?? seedMessages)
      setSource("mock")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const payload = await fetchClinicianMessages()
      setMessages(payload.messages)
      setReadPatientIds(payload.readPatientIds)
      setSource(payload.source)
      setError(null)
    } catch {
      setError(null)
      setMessages(seedMessages)
      setSource("mock")
    } finally {
      setLoading(false)
    }
  }, [useSupabase])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    if (!useSupabase && source === "mock") {
      saveMockClinicianMessages(messages)
    }
  }, [messages, useSupabase, source])

  useEffect(() => {
    const onRead = () => setReadVersion((v) => v + 1)
    window.addEventListener("clinician-messages-read", onRead)
    window.addEventListener("storage", onRead)
    return () => {
      window.removeEventListener("clinician-messages-read", onRead)
      window.removeEventListener("storage", onRead)
    }
  }, [])

  const threads = useMemo(() => {
    void readVersion
    if (source === "supabase") {
      return buildMessageThreads(messages, readPatientIds, patients)
    }
    return buildMessageThreads(messages, undefined, patients)
  }, [messages, readPatientIds, patients, source, readVersion])

  const unreadCount = threads.filter((t) => t.needsReply && !t.read).length

  const getMessagesForPatient = useCallback(
    (patientId: string) => messages.filter((m) => m.patientId === patientId),
    [messages]
  )

  const markThreadRead = useCallback(
    async (patientId: string) => {
      if (source === "supabase") {
        await markClinicianThreadReadApi(patientId)
        setReadPatientIds((prev) =>
          prev.includes(patientId) ? prev : [...prev, patientId]
        )
      } else {
        markMessageThreadRead(patientId)
      }
      bumpReadState()
    },
    [source, bumpReadState]
  )

  const markAllThreadsRead = useCallback(async () => {
    const ids = threads.filter((t) => t.needsReply).map((t) => t.patientId)
    if (ids.length === 0) return

    if (source === "supabase") {
      await markAllClinicianThreadsReadApi(ids)
      setReadPatientIds((prev) => [...new Set([...prev, ...ids])])
    } else {
      markAllMessageThreadsRead(ids)
    }
    bumpReadState()
  }, [threads, source, bumpReadState])

  const sendMessage = useCallback(
    async (patientId: string, content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return null

      if (source === "supabase") {
        const message = await sendClinicianMessage(patientId, trimmed)
        setMessages((prev) => [...prev, message])
        bumpReadState()
        return message
      }

      const patient = patients.find((p) => p.id === patientId)
      if (!patient) return null

      const now = new Date()
      const message: Message = {
        id: `m-${Date.now()}`,
        patientId,
        patientName: patient.name,
        patientPhoto: patient.photo,
        content: trimmed,
        time: now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        isFromDoctor: true,
      }

      setMessages((prev) => [...prev, message])
      bumpReadState()
      return message
    },
    [source, patients, bumpReadState]
  )

  const value = useMemo<ClinicianMessagesContextValue>(
    () => ({
      source,
      loading,
      error,
      messages,
      readPatientIds,
      threads,
      unreadCount,
      reload,
      sendMessage,
      markThreadRead,
      markAllThreadsRead,
      getMessagesForPatient,
      bumpReadState,
    }),
    [
      source,
      loading,
      error,
      messages,
      readPatientIds,
      threads,
      unreadCount,
      reload,
      sendMessage,
      markThreadRead,
      markAllThreadsRead,
      getMessagesForPatient,
      bumpReadState,
    ]
  )

  return (
    <ClinicianMessagesContext.Provider value={value}>
      {children}
    </ClinicianMessagesContext.Provider>
  )
}

export function useClinicianMessages() {
  const ctx = useContext(ClinicianMessagesContext)
  if (!ctx) {
    throw new Error(
      "useClinicianMessages must be used within ClinicianMessagesProvider"
    )
  }
  return ctx
}

/** For components that may render outside the provider (tests). */
export function useClinicianMessagesOptional(): ClinicianMessagesContextValue | null {
  return useContext(ClinicianMessagesContext)
}
