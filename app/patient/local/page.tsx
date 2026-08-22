"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  FileUp,
  Loader2,
  MessageSquare,
  ShieldAlert,
} from "lucide-react"
import { RoleShell } from "@/components/layout/role-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  applyLabExtractToProfile,
  type LabExtractResult,
} from "@/lib/lab-extract"
import { getPatientHealthProfile } from "@/lib/resolve-demo-dates"
import {
  patientQuickReplies,
  type PatientHealthProfile,
} from "@/lib/patient-health-profile"
import { AsOfBadge } from "@/components/demo/as-of-badge"
import { cn } from "@/lib/utils"

function scoreColor(score: number) {
  if (score >= 80) return "text-[#16A34A]"
  if (score >= 60) return "text-[#F59E0B]"
  return "text-destructive"
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <ArrowUpRight className="h-4 w-4" />
  if (trend === "down") return <ArrowDownRight className="h-4 w-4" />
  return <ArrowRight className="h-4 w-4" />
}

function cloneProfile(): PatientHealthProfile {
  return structuredClone(getPatientHealthProfile())
}

export default function PatientDashboardPage() {
  const [profile, setProfile] = useState<PatientHealthProfile>(cloneProfile)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verified, setVerified] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >(() => {
    const p = getPatientHealthProfile()
    return [
      {
        role: "assistant",
        content: `Hi ${p.name.split(" ")[0]} — I can see your Health Score (${p.healthScore}), HbA1c, BP, and visit history. Ask me anything about your profile.`,
      },
    ]
  })
  const [chatLoading, setChatLoading] = useState(false)
  const [uploadNote, setUploadNote] = useState<string | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [updatedMetricIds, setUpdatedMetricIds] = useState<string[]>([])

  const scoreRing = useMemo(
    () => scoreColor(profile.healthScore),
    [profile.healthScore]
  )

  async function sendChat(text: string) {
    const trimmed = text.trim()
    if (!trimmed || chatLoading) return
    setChatInput("")
    setMessages((prev) => [...prev, { role: "user", content: trimmed }])
    setChatLoading(true)
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, patientId: profile.id }),
      })
      const data = (await res.json()) as { reply?: string }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ??
            "I could not generate a reply right now. Please try again.",
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Your HbA1c and rising home BP are the main drivers of elevated risk. Book a follow-up and keep logging morning readings.",
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  async function handleUpload(file: File | null) {
    if (!file || uploadLoading) return
    setUploadLoading(true)
    setUploadNote(`Reading “${file.name}”…`)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/ai/extract-labs", {
        method: "POST",
        body: form,
      })
      const data = (await res.json()) as {
        extract?: LabExtractResult
        mode?: string
        usedDemoFallbackText?: boolean
        error?: string
      }
      if (!res.ok || !data.extract) {
        setUploadNote(data.error ?? "Could not extract labs from this file.")
        return
      }

      const next = applyLabExtractToProfile(profile, data.extract)
      setProfile(next)
      setUpdatedMetricIds(
        data.extract.values.map((v) =>
          v.metricId === "other" ? "glucose" : v.metricId
        )
      )
      setUploadNote(
        `${data.extract.summary}${
          data.usedDemoFallbackText
            ? " (PDF had little text — used demo lab template + AI extract.)"
            : ""
        } · mode: ${data.mode ?? "mock"}`
      )
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I updated your dashboard from the uploaded document. ${data.extract!.summary}`,
        },
      ])
    } catch {
      setUploadNote(
        "Upload failed. Try again or use the sample .txt lab report."
      )
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <RoleShell role="patient">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Health Dashboard
          </h1>
          <p className="text-muted-foreground">
            {profile.name} · {profile.age} · {profile.city}, {profile.state}{" "}
            {profile.zip}
          </p>
          <AsOfBadge className="mt-2" />
        </div>

        {profile.verification && !verified && (
          <Card className="border-[#F59E0B]/50 bg-[#F59E0B]/10">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 text-[#F59E0B]" />
                <div>
                  <p className="font-semibold text-foreground">
                    You have a visit verification request
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.verification.source}: confirm visit with{" "}
                    {profile.verification.providerName} on{" "}
                    {profile.verification.visitDate}.
                  </p>
                </div>
              </div>
              <Button onClick={() => setVerifyOpen(true)}>Verify visit</Button>
            </CardContent>
          </Card>
        )}

        {verified && (
          <Card className="border-[#16A34A]/40 bg-[#16A34A]/10">
            <CardContent className="p-4 text-sm text-foreground">
              Verification submitted (demo). Response would be sent back to
              FraudShield (S2).
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          <Card
            className={cn(updatedMetricIds.length > 0 && "ring-2 ring-primary/40")}
          >
            <CardHeader>
              <CardTitle className="text-base">Health Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <div className={cn("text-5xl font-bold", scoreRing)}>
                {profile.healthScore}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendIcon trend={profile.healthScoreTrend} />
                Trend {profile.healthScoreTrend}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {profile.healthScoreExplanation}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {profile.diagnoses.map((d) => (
                  <Badge key={d} variant="secondary">
                    {d}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {profile.metrics.map((m) => (
                <Card
                  key={m.id}
                  className={cn(
                    updatedMetricIds.includes(m.id) && "ring-2 ring-primary/50"
                  )}
                >
                  <CardContent className="space-y-1 p-4">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-xl font-semibold text-foreground">
                      {m.value}
                      {m.unit ? (
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          {m.unit}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Normal: {m.normalRange}
                    </p>
                    <p
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        m.status === "high" && "text-destructive",
                        m.status === "watch" && "text-[#F59E0B]",
                        m.status === "normal" && "text-[#16A34A]"
                      )}
                    >
                      <TrendIcon trend={m.trend} />
                      {m.trendLabel}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Visit timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.visits.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {v.date} · {v.specialist}
                    </p>
                    <p className="text-sm text-muted-foreground">{v.diagnosis}</p>
                  </div>
                ))}
                <label
                  className={cn(
                    "mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-muted/40",
                    uploadLoading && "pointer-events-none opacity-70"
                  )}
                >
                  {uploadLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                  {uploadLoading
                    ? "Extracting labs with AI…"
                    : "Upload lab report (PDF or TXT)"}
                  <input
                    type="file"
                    accept="application/pdf,.pdf,text/plain,.txt"
                    className="hidden"
                    disabled={uploadLoading}
                    onChange={(e) => {
                      void handleUpload(e.target.files?.[0] ?? null)
                      e.target.value = ""
                    }}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  Demo sample:{" "}
                  <a
                    className="text-primary underline"
                    href="/demo/sarah-johnson-lab-report.txt"
                    download
                  >
                    sarah-johnson-lab-report.txt
                  </a>
                </p>
                {uploadNote && (
                  <p className="text-xs text-primary">{uploadNote}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active risks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.risks.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "text-white",
                          r.level === "High" && "bg-destructive",
                          r.level === "Medium" && "bg-[#F59E0B]",
                          r.level === "Low" && "bg-[#16A34A]"
                        )}
                      >
                        {r.level}
                      </Badge>
                      <p className="font-medium text-foreground">{r.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {r.recommendation}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/25 bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-base text-primary">
                AI Health Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-card p-3">
                {messages.map((m, i) => (
                  <div
                    key={`${m.role}-${i}`}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      m.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "self-end bg-primary text-primary-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                {chatLoading && (
                  <p className="text-xs text-muted-foreground">Thinking…</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {patientQuickReplies.map((q) => (
                  <Button
                    key={q}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => sendChat(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  void sendChat(chatInput)
                }}
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your health profile…"
                />
                <Button type="submit" disabled={chatLoading}>
                  Send
                </Button>
              </form>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Answers use your profile context via Groq (falls back to mock if
                no API key).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {profile.verification?.headline} ({profile.verification?.source})
            </p>
            {profile.verification?.questions.map((q) => (
              <div key={q.id} className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">{q.prompt}</p>
                <Input
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Your answer"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setVerified(true)
                setVerifyOpen(false)
              }}
            >
              Submit verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleShell>
  )
}
