"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, HeartPulse, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { buildVitaPatientUrl, getVitaPatientUrl } from "@/lib/vita-link"

export function VitaPatientRedirect() {
  const vitaUrl = getVitaPatientUrl()
  const targetUrl = vitaUrl ? buildVitaPatientUrl({ baseUrl: vitaUrl }) : null
  const [redirecting, setRedirecting] = useState(true)

  useEffect(() => {
    if (!targetUrl) return
    const timer = window.setTimeout(() => {
      window.location.assign(targetUrl)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [targetUrl])

  if (!targetUrl) return null

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {redirecting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <HeartPulse className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Opening Vita AI patient portal
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Module 1.1 — dashboard, medical profile, devices, and AI assistant.
              You may need to sign in to Vita if your session expired.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <a href={targetUrl} onClick={() => setRedirecting(true)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Vita AI
            </a>
          </Button>
          <p className="break-all text-xs text-muted-foreground">{targetUrl}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Back to sign in
              </Button>
            </Link>
            <Link href="/patient/local">
              <Button variant="outline" size="sm">
                Use built-in local demo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
