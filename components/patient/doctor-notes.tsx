"use client"

import { useState } from "react"
import { FileText, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface DoctorNotesProps {
  patientId: string
}

export function DoctorNotes({ patientId }: DoctorNotesProps) {
  const [note, setNote] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    if (!note.trim()) return
    console.log("[v0] Saving note for patient:", patientId, note)
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      setNote("")
    }, 2000)
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
        <Textarea
          placeholder="Add clinical notes, observations, or reminders..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <Button
          className="mt-3 w-full"
          onClick={handleSave}
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
