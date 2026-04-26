"use client"

import { useState } from "react"
import { Sparkles, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AISummary } from "@/lib/types"

interface AISummaryCardProps {
  summary: AISummary | undefined
}

export function AISummaryCard({ summary }: AISummaryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!summary) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No AI summary available yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg text-primary">{summary.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {summary.insights.slice(0, 3).map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
          <Button
            className="mt-4 w-full"
            onClick={() => setIsModalOpen(true)}
          >
            View Full Summary
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {summary.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Generated on{" "}
              {new Date(summary.generatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            <ul className="flex flex-col gap-3">
              {summary.insights.map((insight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
