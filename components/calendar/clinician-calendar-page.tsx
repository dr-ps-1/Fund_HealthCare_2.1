"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Video,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { AddVisitDialog } from "@/components/calendar/add-visit-dialog"
import { AppLink } from "@/components/ui/app-link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { toast } from "@/hooks/use-toast"
import { useWallClock } from "@/lib/use-wall-clock"
import {
  addDaysToIso,
  formatDayHeading,
  formatTimeNow,
  formatWeekRangeLabel,
  overlappingAppointmentIds,
  parseDisplayTime,
  parseLocalDateIso,
  toLocalDateIso,
  weekDateIsos,
} from "@/lib/calendar"
import { DEMO_STAR_PATIENT_ID, DEMO_VITA_PATIENT_ID } from "@/lib/demo-patients"
import { buildVitaPatientUrl, getVitaPatientUrl } from "@/lib/vita-link"
import type { TodayAppointment } from "@/lib/doctor-dashboard-data"
import { notifyRouteChange } from "@/lib/route-overlay"
import { cn } from "@/lib/utils"

type CalendarView = "day" | "week"
type VisitFilter = "all" | "rpm" | "in-person" | "telehealth"

const FILTERS: { id: VisitFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rpm", label: "RPM" },
  { id: "in-person", label: "In-person" },
  { id: "telehealth", label: "Telehealth" },
]

function isTelehealthVisit(appointment: TodayAppointment): boolean {
  return /telehealth/i.test(`${appointment.type} ${appointment.location}`)
}

function matchesFilter(
  appointment: TodayAppointment,
  filter: VisitFilter
): boolean {
  if (filter === "all") return true
  if (filter === "rpm") return Boolean(appointment.rpmConnected)
  if (filter === "telehealth") return isTelehealthVisit(appointment)
  return !isTelehealthVisit(appointment)
}

function AppointmentCard({
  appointment,
  compact = false,
  overlapping = false,
  onReschedule,
  onCancel,
}: {
  appointment: TodayAppointment
  compact?: boolean
  overlapping?: boolean
  onReschedule: (appointment: TodayAppointment) => void
  onCancel: (appointment: TodayAppointment) => void
}) {
  const router = useRouter()
  const isStar = appointment.patientId === DEMO_STAR_PATIENT_ID
  const telehealth = isTelehealthVisit(appointment)
  const vitaUrl =
    appointment.patientId === DEMO_VITA_PATIENT_ID
      ? getVitaPatientUrl()
      : null

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        isStar ? "border-primary/40 bg-primary/[0.03]" : "border-border",
        overlapping && "border-destructive/50 bg-destructive/[0.04]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium tabular-nums text-foreground">
              {appointment.time}
            </span>
            {telehealth && (
              <Video className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {overlapping && (
              <Badge
                variant="outline"
                className="border-destructive/40 text-[10px] font-normal text-destructive"
              >
                Overlap
              </Badge>
            )}
          </div>
          <AppLink
            href={appointment.href}
            className="block truncate text-sm font-medium text-foreground hover:underline"
          >
            {appointment.patientName}
          </AppLink>
          {!compact && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {appointment.type} · {appointment.reason}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-start gap-1">
          <div className="flex flex-col items-end gap-1">
            {appointment.rpmConnected && (
              <Badge variant="outline" className="text-[10px] font-normal">
                RPM
              </Badge>
            )}
            {appointment.isNewPatient && (
              <Badge variant="secondary" className="text-[10px]">
                New
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7"
                aria-label={`Actions for ${appointment.patientName}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  notifyRouteChange()
                  router.push(appointment.href)
                }}
              >
                Open chart
              </DropdownMenuItem>
              {vitaUrl && (
                <DropdownMenuItem asChild>
                  <a
                    href={buildVitaPatientUrl({ baseUrl: vitaUrl })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Vita portal
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onReschedule(appointment)}>
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onCancel(appointment)}
              >
                Cancel visit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function DayNowMarker({ now }: { now: Date }) {
  return (
    <div className="flex items-center gap-2 py-1" aria-hidden>
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-destructive">
        Now · {formatTimeNow(now)}
      </span>
      <div className="h-px flex-1 bg-destructive/70" />
    </div>
  )
}

export function ClinicianCalendarPage() {
  const { calendarAppointments, cancelAppointment } = useClinicianData()
  const now = useWallClock()
  const today = toLocalDateIso(now)
  const [view, setView] = useState<CalendarView>("week")
  const [selectedDate, setSelectedDate] = useState(today)
  const [filter, setFilter] = useState<VisitFilter>("all")
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<TodayAppointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<TodayAppointment | null>(
    null
  )

  const weekDays = useMemo(() => weekDateIsos(selectedDate), [selectedDate])

  const filteredAppointments = useMemo(
    () =>
      calendarAppointments.filter((appointment) =>
        matchesFilter(appointment, filter)
      ),
    [calendarAppointments, filter]
  )

  const byDate = useMemo(() => {
    const grouped = new Map<string, TodayAppointment[]>()
    for (const appointment of filteredAppointments) {
      const date = appointment.appointmentDate ?? today
      const list = grouped.get(date) ?? []
      list.push(appointment)
      grouped.set(date, list)
    }
    for (const list of grouped.values()) {
      list.sort(
        (a, b) => parseDisplayTime(a.time) - parseDisplayTime(b.time)
      )
    }
    return grouped
  }, [filteredAppointments, today])

  const overlapByDate = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const [date, items] of byDate) {
      map.set(date, overlappingAppointmentIds(items))
    }
    return map
  }, [byDate])

  const selectedAppointments = byDate.get(selectedDate) ?? []
  const weekCount = weekDays.reduce(
    (sum, date) => sum + (byDate.get(date)?.length ?? 0),
    0
  )

  function shiftSelected(days: number) {
    setSelectedDate((current) => addDaysToIso(current, days))
  }

  function goToToday() {
    setSelectedDate(today)
  }

  function openAdd(date = selectedDate) {
    setEditing(null)
    setSelectedDate(date)
    setAddOpen(true)
  }

  function openReschedule(appointment: TodayAppointment) {
    setEditing(appointment)
    if (appointment.appointmentDate) {
      setSelectedDate(appointment.appointmentDate)
    }
    setAddOpen(true)
  }

  async function confirmCancel() {
    if (!cancelTarget) return
    const name = cancelTarget.patientName
    try {
      await cancelAppointment(cancelTarget.id)
      toast({
        title: "Visit cancelled",
        description: `${name} was removed from the calendar.`,
      })
    } catch (err) {
      toast({
        title: "Could not cancel visit",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setCancelTarget(null)
    }
  }

  function renderAppointment(appointment: TodayAppointment, compact?: boolean) {
    const date = appointment.appointmentDate ?? selectedDate
    return (
      <AppointmentCard
        key={appointment.id}
        appointment={appointment}
        compact={compact}
        overlapping={overlapByDate.get(date)?.has(appointment.id) ?? false}
        onReschedule={openReschedule}
        onCancel={setCancelTarget}
      />
    )
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const showNow = view === "day" && selectedDate === today

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Calendar"
          description="Clinic schedule — visits, RPM check-ins, and follow-up planning"
        >
          <Button onClick={() => openAdd()}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Add visit
          </Button>
        </PageHeader>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => shiftSelected(view === "week" ? -7 : -1)}
              aria-label={view === "week" ? "Previous week" : "Previous day"}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => shiftSelected(view === "week" ? 7 : 1)}
              aria-label={view === "week" ? "Next week" : "Next day"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <p className="text-sm font-medium text-foreground">
              {view === "week"
                ? formatWeekRangeLabel(selectedDate)
                : formatDayHeading(selectedDate)}
            </p>
            {selectedDate !== today && (
              <Button type="button" variant="ghost" size="sm" onClick={goToToday}>
                Today
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              {FILTERS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={filter === item.id ? "secondary" : "ghost"}
                  className="h-8"
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="flex rounded-lg border border-border p-0.5">
              <Button
                type="button"
                size="sm"
                variant={view === "day" ? "secondary" : "ghost"}
                className="h-8"
                onClick={() => setView("day")}
              >
                Day
              </Button>
              <Button
                type="button"
                size="sm"
                variant={view === "week" ? "secondary" : "ghost"}
                className="h-8"
                onClick={() => setView("week")}
              >
                Week
              </Button>
            </div>
          </div>
        </div>

        {view === "week" ? (
          <div className="overflow-x-auto">
            <div className="grid min-w-[720px] grid-cols-7 gap-2">
              {weekDays.map((date) => {
                const items = byDate.get(date) ?? []
                const isToday = date === today
                const isSelected = date === selectedDate
                const weekday = parseLocalDateIso(date).toLocaleDateString(
                  "en-US",
                  { weekday: "short" }
                )
                const dayNumber = parseLocalDateIso(date).getDate()

                return (
                  <div key={date} className="flex min-h-[280px] flex-col">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "mb-2 rounded-lg px-2 py-2 text-left transition-colors",
                        isSelected && "bg-primary/10",
                        !isSelected && "hover:bg-muted/60"
                      )}
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {weekday}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-lg font-semibold tabular-nums",
                          isToday ? "text-primary" : "text-foreground"
                        )}
                      >
                        {dayNumber}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {items.length} visit{items.length === 1 ? "" : "s"}
                      </p>
                    </button>
                    <div className="flex flex-1 flex-col gap-2">
                      {items.map((appointment) =>
                        renderAppointment(appointment, true)
                      )}
                      <button
                        type="button"
                        onClick={() => openAdd(date)}
                        className="mt-auto rounded-lg border border-dashed border-border px-2 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        Add visit
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {weekCount} visit{weekCount === 1 ? "" : "s"} this week · open a
              visit menu to reschedule or cancel
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              {showNow && selectedAppointments.length === 0 && (
                <DayNowMarker now={now} />
              )}
              {selectedAppointments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-3 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No visits on this day.
                  </p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="outline"
                    onClick={() => openAdd()}
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Add visit
                  </Button>
                </div>
              ) : (
                (() => {
                  const nodes: ReactNode[] = []
                  let insertedNow = !showNow
                  for (const appointment of selectedAppointments) {
                    if (
                      !insertedNow &&
                      parseDisplayTime(appointment.time) > nowMinutes
                    ) {
                      nodes.push(
                        <DayNowMarker key="now-marker" now={now} />
                      )
                      insertedNow = true
                    }
                    nodes.push(renderAppointment(appointment))
                  }
                  if (!insertedNow) {
                    nodes.push(<DayNowMarker key="now-marker" now={now} />)
                  }
                  return nodes
                })()
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AddVisitDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) setEditing(null)
        }}
        defaultDate={selectedDate}
        editing={editing}
      />

      <AlertDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this visit?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget
                ? `${cancelTarget.patientName} at ${cancelTarget.time} will be removed from the calendar.`
                : "This visit will be removed from the calendar."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep visit</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "bg-destructive text-white hover:bg-destructive/90"
              )}
              onClick={() => void confirmCancel()}
            >
              Cancel visit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
