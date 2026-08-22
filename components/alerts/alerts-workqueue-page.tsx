"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  AlertCircle,
  Check,
  FileKey,
  FileText,
  FlaskConical,
  MessageSquare,
  Pill,
  Share2,
  X,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertQueueStatsStrip } from "@/components/alerts/alert-queue-stats-strip"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { filterInboxForWorkqueue } from "@/lib/clinician-inbox-feed"
import type { InboxItem } from "@/lib/doctor-dashboard-data"
import { isFullChartPatient } from "@/lib/demo-patients"
import {
  buildAlertsWorkqueueSearchParams,
  filterActiveAlerts,
  groupAlertsByPatient,
  parseAlertFilterFromParams,
  parseAlertsWorkqueueTab,
  type AlertQueueFilter,
  type AlertsWorkqueueTab,
} from "@/lib/alerts-workqueue"
import type { Alert } from "@/lib/types"
import { cn } from "@/lib/utils"

const ALERT_FILTERS: { id: AlertQueueFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "vitals", label: "Vitals" },
  { id: "behavior", label: "Behavior" },
  { id: "ai", label: "AI" },
]

function inboxIcon(kind: InboxItem["kind"]) {
  switch (kind) {
    case "lab":
      return FlaskConical
    case "message":
      return MessageSquare
    case "refill":
      return Pill
    case "referral":
      return Share2
    case "prior_auth":
      return FileKey
  }
}

export function AlertsWorkqueuePage() {
  return (
    <AppShell>
      <AlertsWorkqueueContent />
    </AppShell>
  )
}

function AlertsWorkqueueContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    alerts: initialAlerts,
    inbox,
    acknowledgeAlert,
    completeInboxTask,
  } = useClinicianData()

  const taskInbox = useMemo(() => filterInboxForWorkqueue(inbox), [inbox])
  const [alerts, setAlerts] = useState(initialAlerts)
  const [activeTab, setActiveTab] = useState<AlertsWorkqueueTab>("tasks")
  const [queueFilter, setQueueFilter] = useState<AlertQueueFilter>("all")

  useEffect(() => {
    setAlerts(initialAlerts)
  }, [initialAlerts])

  const syncFromUrl = useCallback(() => {
    setActiveTab(
      parseAlertsWorkqueueTab(
        searchParams.get("tab"),
        typeof window !== "undefined" ? window.location.hash : null
      )
    )
    setQueueFilter(
      parseAlertFilterFromParams({
        severity: searchParams.get("severity"),
        type: searchParams.get("type"),
      })
    )
  }, [searchParams])

  useEffect(() => {
    syncFromUrl()
  }, [syncFromUrl])

  const pushAlertsUrl = useCallback(
    (next: { tab?: AlertsWorkqueueTab; filter?: AlertQueueFilter }) => {
      const href = `/alerts${buildAlertsWorkqueueSearchParams({
        tab: next.tab ?? activeTab,
        filter: next.filter ?? queueFilter,
      })}`
      router.replace(href)
    },
    [router, activeTab, queueFilter]
  )

  const filteredGroups = useMemo(() => {
    const filtered = filterActiveAlerts(alerts, queueFilter)
    return groupAlertsByPatient(filtered)
  }, [alerts, queueFilter])

  const handleAcknowledgeGroup = (groupAlerts: Alert[]) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        groupAlerts.some((g) => g.id === alert.id)
          ? { ...alert, status: "resolved" as const }
          : alert
      )
    )
    for (const alert of groupAlerts) {
      void acknowledgeAlert(alert.id)
    }
  }

  const activeAlertCount = alerts.filter((a) => a.status === "active").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alerts & inbox"
        description="Clinical alerts and physician tasks across your attributed panel"
      />

      <AlertQueueStatsStrip />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const tab = value as AlertsWorkqueueTab
          setActiveTab(tab)
          pushAlertsUrl({ tab })
        }}
      >
        <TabsList>
          <TabsTrigger value="tasks">
            Tasks
            {taskInbox.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs tabular-nums text-primary">
                {taskInbox.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Clinical alerts
            {activeAlertCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs tabular-nums text-primary">
                {activeAlertCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <Card id="tasks">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tasks due today</CardTitle>
              <p className="text-sm text-muted-foreground">
                Prior auth, refills, referrals, and labs requiring action
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {taskInbox.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No open tasks — you&apos;re caught up.
                </p>
              ) : (
                taskInbox.map((item) => {
                  const Icon = inboxIcon(item.kind)
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                        item.priority === "high"
                          ? "border-destructive/30 bg-destructive/[0.02]"
                          : "border-border"
                      )}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <Icon
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            item.priority === "high"
                              ? "text-destructive"
                              : "text-muted-foreground"
                          )}
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {item.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.patientName} · {item.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Link href={item.href}>
                          <Button size="sm" variant="outline">
                            Open
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void completeInboxTask(item.id)}
                        >
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 pb-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-lg">Clinical alerts</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Grouped by patient · vitals, adherence, and AI signals
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALERT_FILTERS.map((f) => (
                  <Button
                    key={f.id}
                    type="button"
                    size="sm"
                    variant={queueFilter === f.id ? "default" : "outline"}
                    onClick={() => {
                      setQueueFilter(f.id)
                      pushAlertsUrl({ filter: f.id, tab: "alerts" })
                    }}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {filteredGroups.map((group) => (
                  <div
                    key={group.patientId}
                    className={cn(
                      "rounded-lg border p-4",
                      group.severity === "high" &&
                        "border-destructive/40 bg-destructive/[0.03]",
                      group.severity === "medium" &&
                        "border-[#F59E0B]/40 bg-[#F59E0B]/[0.03]",
                      group.severity === "low" && "border-border"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/patients/${group.patientId}`}
                          className="text-base font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {group.patientName}
                        </Link>
                        {group.alerts.length > 1 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {group.alerts.length} active signals
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          group.severity === "high" &&
                            "bg-destructive/10 text-destructive",
                          group.severity === "medium" &&
                            "bg-[#F59E0B]/15 text-[#B45309]",
                          group.severity === "low" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {group.severity}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-3">
                      {group.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start gap-3 border-t border-border/60 pt-3 first:border-0 first:pt-0"
                        >
                          <div className="shrink-0 pt-0.5">
                            {alert.severity === "high" ? (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : (
                              <AlertCircle
                                className={cn(
                                  "h-4 w-4",
                                  alert.severity === "medium"
                                    ? "text-[#F59E0B]"
                                    : "text-muted-foreground"
                                )}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {alert.headline}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {alert.cause}
                            </p>
                            {alert.metric && (
                              <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                                {alert.metric}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {alert.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link href={`/patients/${group.patientId}`}>
                        <Button size="sm">Open chart</Button>
                      </Link>
                      {isFullChartPatient(group.patientId) && (
                        <Link href={`/patients/${group.patientId}?brief=1`}>
                          <Button size="sm" variant="outline">
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            Brief
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcknowledgeGroup(group.alerts)}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Acknowledge
                        {group.alerts.length > 1 ? " all" : ""}
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredGroups.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No active alerts in this view
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try another filter or check open tasks.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
