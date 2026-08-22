"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  Stethoscope,
  Cpu,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FlaskConical,
  UserPlus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TimelineEvent } from "@/lib/types"
import { formatUsDateTime } from "@/lib/demo-clock"
import { DEMO_VITA_PATIENT_ID } from "@/lib/demo-patients"
import { toast } from "@/hooks/use-toast"
import {
  getVitaDeviceSnapshot,
  pullLatestVitaDeviceSync,
  vitaDeviceSyncTimelineEvent,
  type VitaDeviceSnapshot,
} from "@/lib/vita-device-readings"
import { VitaDevicesFeed } from "@/components/patient/vita-devices-feed"
import {
  filterVitaHistoryByPeriod,
  getVitaHealthHistory,
  vitaHistoryKindLabel,
  vitaHistoryRangeLabel,
  VITA_HISTORY_PERIODS,
  type VitaHistoryEvent,
  type VitaHistoryKind,
  type VitaHistoryPeriod,
} from "@/lib/vita-health-history"
import { cn } from "@/lib/utils"

const eventIcons = {
  symptom: Activity,
  device: Stethoscope,
  ai: Cpu,
  visit: Calendar,
  note: FileText,
}

const eventLabels = {
  symptom: "Symptom",
  device: "Device Data",
  ai: "AI Report",
  visit: "Visit",
  note: "Doctor Note",
}

const historyIcons: Record<VitaHistoryKind, typeof ClipboardCheck> = {
  "check-in": ClipboardCheck,
  lab: FlaskConical,
  onboarding: UserPlus,
}

const TIMELINE_TABS = [
  { value: "all", label: "All" },
  { value: "symptom", label: "Symptoms" },
  { value: "device", label: "Devices" },
  { value: "ai", label: "AI Reports" },
  { value: "visit", label: "Visits" },
  { value: "history", label: "History" },
] as const

type TimelineFilter = (typeof TIMELINE_TABS)[number]["value"]

interface PatientTimelineProps {
  events: TimelineEvent[]
  patientId: string
}

export function PatientTimeline({ events, patientId }: PatientTimelineProps) {
  const [filter, setFilter] = useState<TimelineFilter>("all")
  const [period, setPeriod] = useState<VitaHistoryPeriod>("7d")
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [deviceSnapshot, setDeviceSnapshot] =
    useState<VitaDeviceSnapshot | null>(null)
  const [deviceSyncing, setDeviceSyncing] = useState(false)

  useEffect(() => {
    setDeviceSnapshot(getVitaDeviceSnapshot(patientId))
  }, [patientId])

  const showHistory = filter === "history"
  const showDevices = filter === "device"
  const vitaHistory = useMemo(
    () => getVitaHealthHistory(patientId),
    [patientId]
  )
  const visibleHistory = useMemo(
    () => filterVitaHistoryByPeriod(vitaHistory, period),
    [vitaHistory, period]
  )
  const historyRange = vitaHistoryRangeLabel(visibleHistory)
  const isVitaPatient = patientId === DEMO_VITA_PATIENT_ID
  const filteredEvents = useMemo(() => {
    const extra =
      deviceSnapshot && (filter === "all" || filter === "device")
        ? [vitaDeviceSyncTimelineEvent(deviceSnapshot)]
        : []
    const extraIds = new Set(extra.map((event) => event.id))
    const rest = events.filter(
      (event) =>
        (filter === "all" || event.type === filter) && !extraIds.has(event.id)
    )
    return [...extra, ...rest].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [deviceSnapshot, events, filter])

  async function handleVitaDeviceSync() {
    setDeviceSyncing(true)
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    const next = pullLatestVitaDeviceSync(patientId)
    setDeviceSnapshot(next)
    setDeviceSyncing(false)
    if (next) {
      toast({
        title: "Vita devices synced",
        description:
          "Ava’s Withings and Dexcom readings are now on this chart.",
      })
    }
  }

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <div className="flex w-full flex-wrap gap-1 rounded-lg bg-muted p-1">
          {TIMELINE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div key={filter}>
          {showHistory ? (
            <VitaHistoryFeed
              events={visibleHistory}
              period={period}
              onPeriodChange={setPeriod}
              rangeLabel={historyRange}
              isVitaPatient={isVitaPatient}
            />
          ) : (
            <div>
              {showDevices && deviceSnapshot && (
                <VitaDevicesFeed
                  snapshot={deviceSnapshot}
                  syncing={deviceSyncing}
                  onSync={() => void handleVitaDeviceSync()}
                />
              )}
              <TimelineEventList
                events={filteredEvents}
                expandedEvents={expandedEvents}
                onToggleExpand={toggleExpand}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TimelineEventList({
  events,
  expandedEvents,
  onToggleExpand,
}: {
  events: TimelineEvent[]
  expandedEvents: Set<string>
  onToggleExpand: (eventId: string) => void
}) {
  return (
    <div className="relative">
      <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />
      <div className="flex flex-col gap-4">
        {events.map((event) => {
          const Icon = eventIcons[event.type] ?? FileText
          const isExpanded = expandedEvents.has(event.id)

          return (
            <div key={event.id} className="relative pl-10">
              <div
                className={cn(
                  "absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-card",
                  event.type === "symptom" &&
                    "border-destructive/50 bg-destructive/10",
                  event.type === "device" &&
                    "border-[#F59E0B]/50 bg-[#F59E0B]/10",
                  event.type === "ai" && "border-primary/50 bg-primary/10",
                  event.type === "visit" &&
                    "border-[#16A34A]/50 bg-[#16A34A]/10",
                  event.type === "note" && "border-[#6B7280]/50 bg-[#6B7280]/10"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    event.type === "symptom" && "text-destructive",
                    event.type === "device" && "text-[#F59E0B]",
                    event.type === "ai" && "text-primary",
                    event.type === "visit" && "text-[#16A34A]",
                    event.type === "note" && "text-[#6B7280]"
                  )}
                />
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {eventLabels[event.type]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatUsDateTime(event.date)}
                      </span>
                    </div>
                    <h4 className="mt-1 font-medium text-foreground">
                      {event.headline}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    {isExpanded && event.fullText && (
                      <div className="mt-3 rounded-lg bg-muted p-3 text-sm text-foreground">
                        {event.fullText}
                      </div>
                    )}
                  </div>
                  {event.fullText && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleExpand(event.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="mr-1 h-4 w-4" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-4 w-4" />
                          Expand
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {events.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No events found for this filter.
          </div>
        )}
      </div>
    </div>
  )
}

function VitaHistoryFeed({
  events,
  period,
  onPeriodChange,
  rangeLabel,
  isVitaPatient,
}: {
  events: VitaHistoryEvent[]
  period: VitaHistoryPeriod
  onPeriodChange: (value: VitaHistoryPeriod) => void
  rangeLabel: string | null
  isVitaPatient: boolean
}) {
  const checkInCount = events.filter((event) => event.kind === "check-in").length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{events.length} events</Badge>
          {rangeLabel && <Badge variant="outline">{rangeLabel}</Badge>}
          {isVitaPatient && (
            <Badge variant="outline" className="border-primary/40 text-primary">
              Vita RPM
            </Badge>
          )}
          {checkInCount > 0 && (
            <Badge variant="secondary">{checkInCount} check-ins</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Period
          </span>
          <Select
            value={period}
            onValueChange={(value) =>
              onPeriodChange(value as VitaHistoryPeriod)
            }
          >
            <SelectTrigger size="sm" className="min-w-[10.5rem] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VITA_HISTORY_PERIODS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isVitaPatient ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Vita health history is available for RPM-connected patients. Ava
          Jackson has the linked Vita timeline.
        </p>
      ) : events.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No Vita history in this period. Try a longer range.
        </p>
      ) : (
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />
          <div className="flex flex-col gap-4">
            {events.map((event) => {
              const Icon = historyIcons[event.kind]
              return (
                <div key={event.id} className="relative pl-10">
                  <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">
                          {event.title}
                        </h4>
                        <Badge variant="secondary" className="text-[10px]">
                          {vitaHistoryKindLabel(event.kind)}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatUsDateTime(event.date)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.summary}
                    </p>
                    {event.metrics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {event.metrics.map((metric) => (
                          <span
                            key={`${event.id}-${metric.label}`}
                            className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                          >
                            {metric.label} {metric.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
