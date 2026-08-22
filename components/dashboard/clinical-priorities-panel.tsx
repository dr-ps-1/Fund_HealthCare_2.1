"use client"

import { AppLink } from "@/components/ui/app-link"
import { useMemo } from "react"
import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { computeClinicalPriorities } from "@/lib/clinical-priorities"
import { cn } from "@/lib/utils"

export function ClinicalPrioritiesPanel() {
  const { patients, alerts } = useClinicianData()
  const priorities = useMemo(
    () => computeClinicalPriorities(patients, alerts),
    [patients, alerts]
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div>
          <CardTitle className="text-lg">Clinical priorities</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Patients needing attention today — demo star first, then by urgency
          </p>
        </div>
        <Badge variant="secondary">{priorities.length} open</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-0 pb-4 sm:px-6">
        {priorities.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground sm:px-0">
            No active clinical priorities on your panel.
          </p>
        ) : (
          priorities.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-col gap-3 border-b border-border px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-0",
                item.severity === "high" && "bg-destructive/[0.03]",
                index === 0 && item.severity === "high" && "rounded-t-lg"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{item.patientName}</p>
                  <Badge
                    variant={item.severity === "high" ? "destructive" : "outline"}
                    className="text-[10px] uppercase"
                  >
                    {item.severity === "high" ? "Urgent" : "Monitor"}
                  </Badge>
                  {item.rpmActive && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      RPM
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-foreground">{item.summary}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {item.updatedAt}
                </p>
              </div>
              <div className="shrink-0">
                {item.supportsBrief ? (
                  <AppLink href={`/patients/${item.patientId}?brief=1`}>
                    <Button size="sm">
                      <FileText className="mr-1.5 h-3.5 w-3.5" />
                      Review for visit
                    </Button>
                  </AppLink>
                ) : (
                  <AppLink href={`/patients/${item.patientId}`}>
                    <Button size="sm" variant="outline">
                      Open chart
                    </Button>
                  </AppLink>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
