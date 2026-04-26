"use client"

import { Sparkles, TrendingDown, Pill } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const insights = [
  {
    icon: TrendingDown,
    text: "3 patients showing worsening trends",
    severity: "high",
  },
  {
    icon: Pill,
    text: "2 missed medications patterns detected",
    severity: "medium",
  },
]

export function AIInsightsWidget() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <CardTitle className="text-primary">AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center gap-3">
              <insight.icon
                className={`h-4 w-4 ${
                  insight.severity === "high" ? "text-destructive" : "text-[#F59E0B]"
                }`}
              />
              <span className="text-sm text-foreground">{insight.text}</span>
            </div>
          ))}
          <Link href="/analytics">
            <Button className="mt-2 w-full">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
