"use client"

import { AlertTriangle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Alert } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PatientAlertsCardProps {
  alerts: Alert[]
}

export function PatientAlertsCard({ alerts }: PatientAlertsCardProps) {
  const activeAlerts = alerts.filter((a) => a.status === "active")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Alerts ({activeAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-3",
                  alert.severity === "high" &&
                    "border-destructive/50 bg-destructive/5",
                  alert.severity === "medium" &&
                    "border-[#F59E0B]/50 bg-[#F59E0B]/5",
                  alert.severity === "low" && "border-border"
                )}
              >
                {alert.severity === "high" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                ) : (
                  <AlertCircle
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      alert.severity === "medium"
                        ? "text-[#F59E0B]"
                        : "text-muted-foreground"
                    )}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {alert.headline}
                  </p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
