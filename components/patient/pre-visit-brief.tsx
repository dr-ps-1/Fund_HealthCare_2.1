"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  FileText,
  Loader2,
  Printer,
  TestTube2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { saveChartNoteAction } from "@/lib/save-chart-note-action"
import { isSupabaseMessagingEnabled } from "@/lib/config/public-env"
import {
  loadStoredPreVisitBrief,
  saveStoredPreVisitBrief,
} from "@/lib/previsit-brief-local"
import {
  buildFallbackPreVisitBrief,
  formatPreVisitBriefAsText,
  formatPreVisitProvenance,
  type PreVisitBriefMode,
  type StoredPreVisitBrief,
} from "@/lib/previsit-brief"
import { toast } from "@/hooks/use-toast"
import type {
  AIRecommendation,
  AISummary,
  Alert,
  Patient,
  PreVisitBrief,
} from "@/lib/types"

interface PreVisitBriefCardProps {
  patient: Patient
  summary?: AISummary
  alerts?: Alert[]
  panelRecommendations?: AIRecommendation[]
  autoGenerate?: boolean
  generateTrigger?: number
  onScheduleVisit?: () => void
}

type RecommendationItem = {
  id: string
  text: string
  source: "panel" | "brief"
}

function recommendationActions(text: string) {
  const lower = text.toLowerCase()
  return {
    schedule: /schedule|visit|follow-up|appointment|chronic-care/.test(lower),
    labs: /order|lab|hba1c|cmp|lipid|repeat|acr/.test(lower),
  }
}

function BriefBody({ brief }: { brief: PreVisitBrief }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-foreground">{brief.overview}</p>
      <div>
        <p className="mb-1 font-semibold text-foreground">History</p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {brief.history.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 font-semibold text-foreground">Current problems</p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {brief.currentProblems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SafetyStrip({
  patient,
  alerts,
}: {
  patient: Patient
  alerts: Alert[]
}) {
  const highAlerts = alerts.filter(
    (alert) => alert.status === "active" && alert.severity === "high"
  )
  if (!patient.allergies.length && highAlerts.length === 0) return null

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
      <p className="mb-1 flex items-center gap-1.5 font-medium text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Safety at visit
      </p>
      <ul className="space-y-1 text-foreground">
        {patient.allergies.length > 0 && (
          <li>Allergies: {patient.allergies.join(", ")}</li>
        )}
        {highAlerts.map((alert) => (
          <li key={alert.id}>
            {alert.headline}
            {alert.metric ? ` — ${alert.metric}` : ""}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PreVisitBriefCard({
  patient,
  summary,
  alerts = [],
  panelRecommendations = [],
  autoGenerate = false,
  generateTrigger = 0,
  onScheduleVisit,
}: PreVisitBriefCardProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "ready">("idle")
  const [brief, setBrief] = useState<PreVisitBrief | null>(null)
  const [provenance, setProvenance] = useState<StoredPreVisitBrief | null>(null)
  const [briefExpanded, setBriefExpanded] = useState(false)
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(
    () => new Set()
  )

  const activeAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === "active"),
    [alerts]
  )

  const recommendationItems = useMemo((): RecommendationItem[] => {
    if (brief) {
      return brief.recommendations.map((text, index) => ({
        id: `brief-rec-${index}`,
        text,
        source: "brief" as const,
      }))
    }
    return panelRecommendations
      .filter((rec) => !rec.acknowledged && !acknowledgedIds.has(rec.id))
      .map((rec) => ({
        id: rec.id,
        text: rec.text,
        source: "panel" as const,
      }))
  }, [brief, panelRecommendations, acknowledgedIds])

  const hydrateFromStorage = useCallback(() => {
    const stored = loadStoredPreVisitBrief(patient.id)
    if (!stored) return false
    setBrief(stored.brief)
    setProvenance(stored)
    setPhase("ready")
    setBriefExpanded(true)
    return true
  }, [patient.id])

  const generate = useCallback(async () => {
    setPhase("loading")
    try {
      const res = await fetch("/api/ai/previsit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id }),
      })
      const data = (await res.json()) as {
        brief?: PreVisitBrief
        mode?: PreVisitBriefMode
        generatedAt?: string
      }
      const nextBrief = data.brief ?? buildFallbackPreVisitBrief(patient)
      const stored: StoredPreVisitBrief = {
        brief: nextBrief,
        mode: data.mode ?? "fallback",
        generatedAt: data.generatedAt ?? new Date().toISOString(),
      }
      setBrief(nextBrief)
      setProvenance(stored)
      saveStoredPreVisitBrief(patient.id, stored)
      setBriefExpanded(true)
      if (isSupabaseMessagingEnabled()) {
        await saveChartNoteAction(
          patient.id,
          `[Pre-visit brief]\n${nextBrief.overview}`
        )
      }
    } catch {
      const stored: StoredPreVisitBrief = {
        brief: buildFallbackPreVisitBrief(patient),
        mode: "fallback",
        generatedAt: new Date().toISOString(),
      }
      setBrief(stored.brief)
      setProvenance(stored)
      saveStoredPreVisitBrief(patient.id, stored)
      setBriefExpanded(true)
    } finally {
      setPhase("ready")
    }
  }, [patient])

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  useEffect(() => {
    if (!autoGenerate) return
    document.getElementById("visit-prep")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
    void generate()
  }, [autoGenerate, generate])

  useEffect(() => {
    if (generateTrigger <= 0) return
    document.getElementById("visit-prep")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
    void generate()
  }, [generateTrigger, generate])

  function acknowledgeRecommendation(id: string) {
    setAcknowledgedIds((prev) => new Set(prev).add(id))
    toast({ title: "Recommendation acknowledged" })
  }

  async function handleLabAction(item: RecommendationItem) {
    const content = `[Lab order noted] ${item.text}`
    try {
      await saveChartNoteAction(patient.id, content)
      toast({
        title: "Saved to chart notes",
        description: "Lab order documented for this visit.",
      })
      acknowledgeRecommendation(item.id)
    } catch (err) {
      toast({
        title: "Could not save note",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      })
    }
  }

  async function handleCopyBrief() {
    if (!brief) return
    const text = formatPreVisitBriefAsText(
      patient,
      brief,
      provenance ?? undefined
    )
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "Brief copied to clipboard" })
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not access clipboard.",
        variant: "destructive",
      })
    }
  }

  function handlePrintBrief() {
    if (!brief) return
    const body = document.body
    body.classList.add("printing-visit-prep")
    const cleanup = () => {
      body.classList.remove("printing-visit-prep")
      window.removeEventListener("afterprint", cleanup)
    }
    window.addEventListener("afterprint", cleanup)
    window.print()
  }

  return (
    <Card id="visit-prep" className="scroll-mt-24 border-brand-navy/20">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <FileText className="h-4 w-4 text-brand-navy" />
        <CardTitle className="text-base">Visit prep</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {summary && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {summary.title}
            </p>
            <ul className="flex flex-col gap-2">
              {summary.insights.map((insight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SafetyStrip patient={patient} alerts={activeAlerts} />

        {recommendationItems.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              {brief ? "Recommended actions" : "Panel care tasks"}
            </p>
            <div className="flex flex-col gap-2">
              {recommendationItems.map((item) => {
                const actions = recommendationActions(item.text)
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <p className="flex-1 text-sm text-foreground">{item.text}</p>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1">
                      {actions.labs && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Note lab order"
                          onClick={() => void handleLabAction(item)}
                        >
                          <TestTube2 className="h-4 w-4" />
                        </Button>
                      )}
                      {actions.schedule && onScheduleVisit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Schedule visit"
                          onClick={() => {
                            onScheduleVisit()
                            acknowledgeRecommendation(item.id)
                          }}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Acknowledge"
                        onClick={() => acknowledgeRecommendation(item.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {phase === "idle" && !brief && (
          <Button onClick={() => void generate()} className="w-full">
            Generate full brief
          </Button>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
            <p className="text-sm">Preparing brief from chart context…</p>
          </div>
        )}

        {phase === "ready" && brief && (
          <Collapsible open={briefExpanded} onOpenChange={setBriefExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>Full pre-visit brief</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${briefExpanded ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <BriefBody brief={brief} />
            </CollapsibleContent>
          </Collapsible>
        )}

        {provenance && (
          <p className="text-xs text-muted-foreground">
            {formatPreVisitProvenance(
              provenance.mode,
              provenance.generatedAt
            )}
          </p>
        )}

        {brief && phase === "ready" && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void handleCopyBrief()}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintBrief}>
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => void generate()}
            >
              Regenerate brief
            </Button>
          </div>
        )}

        {brief && provenance && (
          <div id="visit-prep-print" className="sr-only" aria-hidden>
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {formatPreVisitBriefAsText(patient, brief, provenance)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
