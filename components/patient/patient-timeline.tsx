"use client"

import { useState } from "react"
import {
  Activity,
  Stethoscope,
  Cpu,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TimelineEvent } from "@/lib/types"
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

interface PatientTimelineProps {
  events: TimelineEvent[]
}

export function PatientTimeline({ events }: PatientTimelineProps) {
  const [filter, setFilter] = useState<string>("all")
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const filteredEvents = events.filter(
    (event) => filter === "all" || event.type === filter
  )

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="symptom">Symptoms</TabsTrigger>
            <TabsTrigger value="device">Devices</TabsTrigger>
            <TabsTrigger value="ai">AI Reports</TabsTrigger>
            <TabsTrigger value="visit">Visits</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="flex flex-col gap-4">
            {filteredEvents.map((event) => {
              const Icon = eventIcons[event.type]
              const isExpanded = expandedEvents.has(event.id)

              return (
                <div key={event.id} className="relative pl-10">
                  <div
                    className={cn(
                      "absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-card",
                      event.type === "symptom" && "border-destructive/50 bg-destructive/10",
                      event.type === "device" && "border-[#F59E0B]/50 bg-[#F59E0B]/10",
                      event.type === "ai" && "border-primary/50 bg-primary/10",
                      event.type === "visit" && "border-[#16A34A]/50 bg-[#16A34A]/10",
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
                            {formatDate(event.date)}
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
                          onClick={() => toggleExpand(event.id)}
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

            {filteredEvents.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No events found for this filter.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
