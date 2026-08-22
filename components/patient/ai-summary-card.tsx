"use client"

import { useState } from "react"
import { ClipboardList, ChevronRight } from "lucide-react"
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
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Chart summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No chart summary available yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">{summary.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {summary.insights.slice(0, 3).map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setIsModalOpen(true)}
          >
            View full summary
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{summary.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Generated{" "}
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
                  className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm"
                >
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
