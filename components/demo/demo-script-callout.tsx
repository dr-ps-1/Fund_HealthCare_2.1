"use client"

import { AppLink } from "@/components/ui/app-link"
import {
  Calendar,
  ExternalLink,
  FileText,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { DEMO_SECONDARY_PATIENT_ID, DEMO_STAR_PATIENT_ID } from "@/lib/demo-patients"
import { useDemoScriptVisible } from "@/lib/demo-visibility"
import { buildVitaPatientUrl, getVitaPatientUrl } from "@/lib/vita-link"

const DEMO_STEPS = [
  {
    step: 1,
    label: "Open Ava's chart & brief",
    href: `/patients/${DEMO_STAR_PATIENT_ID}?brief=1`,
    icon: FileText,
  },
  {
    step: 2,
    label: "Schedule today's visit",
    href: `/patients/${DEMO_STAR_PATIENT_ID}?brief=1&schedule=1`,
    icon: Calendar,
  },
  {
    step: 3,
    label: "Clinical assistant (AI)",
    href: `/patients/${DEMO_STAR_PATIENT_ID}?brief=1&ai=1`,
    icon: Sparkles,
  },
  {
    step: 4,
    label: "Message patient",
    href: `/messages?patient=${DEMO_STAR_PATIENT_ID}`,
    icon: MessageSquare,
  },
] as const

export function DemoScriptCallout() {
  const { source, loading } = useClinicianData()
  const { show, dismiss } = useDemoScriptVisible(source, loading)
  const vitaUrl = getVitaPatientUrl()
  const vitaTarget = vitaUrl ? buildVitaPatientUrl({ baseUrl: vitaUrl }) : null

  if (!show) return null

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Demo walkthrough — 4 clicks
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Ava</span> — Vita RPM
              (BP, inhaler, devices), AI visit prep ·{" "}
              <span className="font-medium text-foreground">Sarah</span> — additional
              urgent flag, HbA1c 9.2%
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground"
            onClick={dismiss}
            aria-label="Hide demo script"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_STEPS.map(({ step, label, href, icon: Icon }) => (
            <li key={step}>
              <AppLink
                href={href}
                className="flex h-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:border-primary/40 hover:bg-card/80"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {step}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {label}
                </span>
              </AppLink>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2 border-t border-primary/20 pt-3">
          <AppLink href={`/patients/${DEMO_STAR_PATIENT_ID}?brief=1&ai=1`}>
            <Button size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Ava — AI assistant
            </Button>
          </AppLink>
          <AppLink href={`/patients/${DEMO_STAR_PATIENT_ID}?brief=1`}>
            <Button size="sm" variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Ava — Brief
            </Button>
          </AppLink>
          <AppLink href={`/patients/${DEMO_SECONDARY_PATIENT_ID}?brief=1`}>
            <Button size="sm" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Sarah — Brief
            </Button>
          </AppLink>
          {vitaTarget && (
            <Button size="sm" variant="outline" asChild>
              <a href={vitaTarget} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Vita portal (Ava)
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
