"use client"

import { useEffect, useState } from "react"
import { FileText, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { isSupabaseMessagingEnabled } from "@/lib/config/public-env"
import {
  loadLocalChartNotes,
  saveLocalChartNote,
} from "@/lib/chart-notes-local"
import {
  CHART_NOTES_UPDATED_EVENT,
} from "@/lib/save-chart-note-action"
import {
  fetchClinicianChartNotes,
  saveClinicianChartNote,
} from "@/lib/clinician-data-api"

interface DoctorNotesProps {
  patientId: string
}

export function DoctorNotes({ patientId }: DoctorNotesProps) {
  const [note, setNote] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [savedNotes, setSavedNotes] = useState<
    { id: string; content: string; created_at: string }[]
  >([])
  const [error, setError] = useState<string | null>(null)
  const useSupabase = isSupabaseMessagingEnabled()

  useEffect(() => {
    const refreshNotes = () => {
      if (useSupabase) {
        void fetchClinicianChartNotes(patientId)
          .then(setSavedNotes)
          .catch(() => {})
        return
      }
      setSavedNotes(loadLocalChartNotes(patientId))
    }

    refreshNotes()

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ patientId: string }>).detail
      if (detail?.patientId === patientId) {
        refreshNotes()
      }
    }
    window.addEventListener(CHART_NOTES_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(CHART_NOTES_UPDATED_EVENT, onUpdated)
  }, [patientId, useSupabase])

  const handleSave = async () => {
    if (!note.trim()) return

    if (useSupabase) {
      try {
        const saved = await saveClinicianChartNote(patientId, note.trim())
        setSavedNotes((prev) => [saved, ...prev])
        setNote("")
        setIsSaved(true)
        setError(null)
        setTimeout(() => setIsSaved(false), 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save note")
      }
      return
    }

    const saved = saveLocalChartNote(patientId, note.trim())
    setSavedNotes((prev) => [saved, ...prev])
    setNote("")
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Doctor&apos;s Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {savedNotes.length > 0 && (
          <div className="mb-4 space-y-2">
            {savedNotes.slice(0, 3).map((saved) => (
              <div
                key={saved.id}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground"
              >
                <p className="whitespace-pre-wrap">{saved.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(saved.created_at).toLocaleString("en-US")}
                </p>
              </div>
            ))}
          </div>
        )}
        <Textarea
          placeholder="Add clinical notes, observations, or reminders..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="resize-none"
        />
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
        <Button
          className="mt-3 w-full"
          onClick={() => void handleSave()}
          disabled={!note.trim() || isSaved}
        >
          {isSaved ? (
            "Saved!"
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
