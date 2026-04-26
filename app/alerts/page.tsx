"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, AlertCircle, X } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { alerts as initialAlerts } from "@/lib/mock-data"
import type { Alert } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity =
      severityFilter === "all" || alert.severity === severityFilter
    const matchesType = typeFilter === "all" || alert.type === typeFilter
    const isActive = alert.status === "active"

    return matchesSeverity && matchesType && isActive
  })

  const handleDismiss = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved" as const } : alert
      )
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage patient alerts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vitals">Vitals</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-4 rounded-xl border p-4",
                    alert.severity === "high" &&
                      "border-destructive/50 bg-destructive/5",
                    alert.severity === "medium" &&
                      "border-[#F59E0B]/50 bg-[#F59E0B]/5",
                    alert.severity === "low" && "border-border bg-card"
                  )}
                >
                  <div className="shrink-0 pt-0.5">
                    {alert.severity === "high" ? (
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    ) : (
                      <AlertCircle
                        className={cn(
                          "h-6 w-6",
                          alert.severity === "medium"
                            ? "text-[#F59E0B]"
                            : "text-muted-foreground"
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {alert.headline}
                        </h3>
                        <p className="text-sm text-primary hover:underline">
                          <Link href={`/patients/${alert.patientId}`}>
                            {alert.patientName}
                          </Link>
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          alert.severity === "high" &&
                            "bg-destructive text-destructive-foreground",
                          alert.severity === "medium" &&
                            "bg-[#F59E0B] text-white",
                          alert.severity === "low" &&
                            "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {alert.cause}
                    </p>
                    {alert.metric && (
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {alert.metric}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {alert.time}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Link href={`/patients/${alert.patientId}`}>
                        <Button size="sm">View Patient</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(alert.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No active alerts matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
