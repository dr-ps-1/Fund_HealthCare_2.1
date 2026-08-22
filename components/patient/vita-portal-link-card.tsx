"use client"

import { ExternalLink, HeartPulse } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { buildVitaPatientUrl, getVitaPatientUrl } from "@/lib/vita-link"

export function VitaPortalLinkCard() {
  const vitaUrl = getVitaPatientUrl()
  if (!vitaUrl) return null

  const target = buildVitaPatientUrl({ baseUrl: vitaUrl })

  return (
    <Card className="border-brand-navy/20 bg-brand-navy-muted/50">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <HeartPulse className="mt-0.5 h-5 w-5 text-brand-navy" />
          <div>
            <p className="font-medium text-foreground">Remote patient monitoring</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Home BP and device readings sync from the patient portal. Review
              before today&apos;s visit and compare to in-clinic trends.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <a href={target} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Patient portal
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
