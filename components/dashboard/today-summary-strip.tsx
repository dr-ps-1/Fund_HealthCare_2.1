"use client"

import Link from "next/link"
import {
  CalendarClock,
  ClipboardList,
  FileKey,
  FlaskConical,
  MessageSquare,
  Pill,
  Share2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import {
  filterInboxForWorkqueue,
  getHomeInboxPreview,
} from "@/lib/clinician-inbox-feed"
import type { InboxItem, TodayAppointment } from "@/lib/doctor-dashboard-data"
import { cn } from "@/lib/utils"

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

function ScheduleList({
  items,
  emptyLabel,
}: {
  items: TodayAppointment[]
  emptyLabel: string
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((appt) => (
        <Link
          key={appt.id}
          href={appt.href}
          className={cn(
            "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50",
            appt.isNext
              ? "border-primary/40 bg-primary/[0.03]"
              : "border-border"
          )}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {appt.dateLabel && (
                <span className="text-xs font-medium text-muted-foreground">
                  {appt.dateLabel}
                </span>
              )}
              <span className="text-sm font-medium tabular-nums text-foreground">
                {appt.time}
              </span>
              <span className="text-sm text-foreground">{appt.patientName}</span>
              {appt.isNext && (
                <Badge variant="secondary" className="text-[10px]">
                  Next up
                </Badge>
              )}
              {appt.isNewPatient && (
                <Badge variant="outline" className="text-[10px]">
                  New
                </Badge>
              )}
              {appt.rpmConnected && (
                <Badge variant="outline" className="text-[10px]">
                  RPM
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {appt.type} — {appt.reason}
            </p>
            {appt.rpmSummary && (
              <p className="mt-1 text-xs text-muted-foreground">
                {appt.rpmSummary}
              </p>
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {appt.location}
          </span>
        </Link>
      ))}
    </div>
  )
}

export function TodaySummaryStrip() {
  const { appointments, upcomingAppointments, inbox } = useClinicianData()
  const workqueueInbox = filterInboxForWorkqueue(inbox)
  const inboxPreview = getHomeInboxPreview(inbox)
  const urgentCount = workqueueInbox.filter((i) => i.priority === "high").length
  const totalTasks = workqueueInbox.length

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Today&apos;s schedule
              </h2>
              <span className="text-xs text-muted-foreground">
                {appointments.length} visits
              </span>
            </div>
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                Open calendar
              </Button>
            </Link>
          </div>
          <ScheduleList
            items={appointments}
            emptyLabel="No visits on today's schedule — schedule from a patient chart."
          />
          {upcomingAppointments.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Upcoming
              </p>
              <ScheduleList
                items={upcomingAppointments}
                emptyLabel=""
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Tasks due today
              </h2>
              {urgentCount > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {urgentCount} urgent
                </span>
              )}
            </div>
            {totalTasks > inboxPreview.length && (
              <Link href="/alerts?tab=tasks">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View all ({totalTasks})
                </Button>
              </Link>
            )}
          </div>
          {inboxPreview.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              Inbox clear for today.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {inboxPreview.map((item) => {
                const Icon = inboxIcon(item.kind)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50",
                      item.priority === "high"
                        ? "border-destructive/30 bg-destructive/[0.02]"
                        : "border-border"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        item.priority === "high"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.patientName} · {item.time}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
