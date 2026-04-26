"use client"

import Link from "next/link"
import { AlertTriangle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { alerts } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function AlertsFeed() {
  const recentAlerts = alerts.filter((a) => a.status === "active").slice(0, 4)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Alerts</CardTitle>
        <Link href="/alerts">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3",
                alert.severity === "high" && "border-destructive/50 bg-destructive/5",
                alert.severity === "medium" && "border-[#F59E0B]/50 bg-[#F59E0B]/5",
                alert.severity === "low" && "border-border"
              )}
            >
              {alert.severity === "high" ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              ) : (
                <AlertCircle
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    alert.severity === "medium" ? "text-[#F59E0B]" : "text-muted-foreground"
                  )}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{alert.headline}</p>
                <p className="text-sm text-muted-foreground">{alert.patientName}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
              <Link href={`/patients/${alert.patientId}?alert=${alert.id}`}>
                <Button size="sm" variant="outline">
                  Open
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
