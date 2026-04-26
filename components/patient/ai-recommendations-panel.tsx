"use client"

import { useState } from "react"
import { AlertCircle, Check, Forward } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AIRecommendation } from "@/lib/types"

interface AIRecommendationsPanelProps {
  recommendations: AIRecommendation[]
}

export function AIRecommendationsPanel({
  recommendations: initialRecommendations,
}: AIRecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState(initialRecommendations)

  const handleAcknowledge = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, acknowledged: true } : rec
      )
    )
  }

  const activeRecommendations = recommendations.filter((r) => !r.acknowledged)

  if (activeRecommendations.length === 0) {
    return null
  }

  return (
    <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {activeRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex items-start gap-3 rounded-lg border border-[#F59E0B]/30 bg-card p-3"
            >
              <p className="flex-1 text-sm text-foreground">{rec.text}</p>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAcknowledge(rec.id)}
                  title="Acknowledge"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" title="Send to Supervisor">
                  <Forward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
