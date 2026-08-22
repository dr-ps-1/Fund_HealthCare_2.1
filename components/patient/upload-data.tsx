"use client"

import { useRef, useState } from "react"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { saveChartNoteAction } from "@/lib/save-chart-note-action"
import type { LabExtractResult } from "@/lib/lab-extract"

interface UploadDataProps {
  patientId: string
}

export function UploadData({ patientId }: UploadDataProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [extract, setExtract] = useState<LabExtractResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setExtract(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setExtract(null)
    try {
      const form = new FormData()
      form.append("file", selectedFile)
      const response = await fetch("/api/ai/extract-labs", {
        method: "POST",
        body: form,
      })
      const data = (await response.json()) as {
        extract?: LabExtractResult
        error?: string
        mode?: string
        usedDemoFallbackText?: boolean
      }

      if (!response.ok || !data.extract) {
        throw new Error(data.error ?? "Failed to extract lab data")
      }

      setExtract(data.extract)

      if (data.usedDemoFallbackText) {
        toast({
          title: "Could not read the uploaded file",
          description:
            "Showing a demo extraction preview. Nothing was saved to the chart.",
          variant: "destructive",
        })
        return
      }
      const noteLines = [
        `[Lab upload] ${selectedFile.name}`,
        description.trim() || undefined,
        data.extract.summary,
        ...data.extract.values.map(
          (v) =>
            `${v.label}: ${v.value}${v.unit ? ` ${v.unit}` : ""}${v.note ? ` — ${v.note}` : ""}`
        ),
      ].filter(Boolean)
      await saveChartNoteAction(patientId, noteLines.join("\n"))
      toast({
        title: "Lab report processed",
        description:
          data.mode === "groq"
            ? "Values extracted and saved to chart notes."
            : "Demo extraction saved to chart notes.",
      })
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try another file.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setExtract(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5" />
          Upload lab report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id={`file-upload-${patientId}`}
            />
            {selectedFile ? (
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <FileText className="h-5 w-5 text-primary" />
                <span className="flex-1 truncate text-sm">{selectedFile.name}</span>
                <Button size="sm" variant="ghost" onClick={clearFile} type="button">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Label
                htmlFor={`file-upload-${patientId}`}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50"
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  PDF or text lab report
                </span>
              </Label>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Outside lab HbA1c panel"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={() => void handleUpload()}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting…
              </>
            ) : (
              "Upload & extract"
            )}
          </Button>

          {extract && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">{extract.summary}</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {extract.values.map((value) => (
                  <li key={`${value.metricId}-${value.label}`}>
                    {value.label}: {value.value}
                    {value.unit ? ` ${value.unit}` : ""}
                    {value.note ? ` — ${value.note}` : ""}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Suggested health score: {extract.suggestedHealthScore}/100
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
