"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ClipboardList,
  FileText,
  MessageSquare,
  Search,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { formatUsDateNumeric } from "@/lib/demo-clock"
import { ClinicalStatusBadge } from "@/components/ui/clinical-status-badge"
import { PageHeader } from "@/components/layout/page-header"
import { DEMO_VITA_PATIENT_ID, isFullChartPatient } from "@/lib/demo-patients"
import {
  buildPanelRosterSearchParams,
  computePanelRosterStats,
  formatPatientLocation,
  formatPatientMrn,
  formatPayerShort,
  getPatientNextVisitLabel,
  getPatientOpenItems,
  matchesRosterFilter,
  parseRosterFilterFromSearchParams,
  parseRosterSortFromSearchParams,
  sortPanelPatients,
  type PanelRosterFilter,
  type PanelRosterSort,
} from "@/lib/panel-roster"
import { cn } from "@/lib/utils"

const QUICK_FILTERS: { id: PanelRosterFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "urgent", label: "Urgent" },
  { id: "attention", label: "Attention" },
  { id: "overdue", label: "Overdue 60d+" },
  { id: "rpm", label: "RPM" },
]

export function PatientPanelPage() {
  return (
    <AppShell>
      <PatientPanelContent />
    </AppShell>
  )
}

function PatientPanelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { patients: allPatients, alerts, inbox, appointments } =
    useClinicianData()

  const [searchQuery, setSearchQuery] = useState("")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [rosterFilter, setRosterFilter] = useState<PanelRosterFilter>("all")
  const [sortBy, setSortBy] = useState<PanelRosterSort>("risk")

  const syncFromUrl = useCallback(() => {
    setSearchQuery(searchParams.get("search") ?? "")
    setConditionFilter(searchParams.get("condition") ?? "all")
    setRosterFilter(
      parseRosterFilterFromSearchParams({
        status: searchParams.get("status"),
        filter: searchParams.get("filter"),
      })
    )
    setSortBy(parseRosterSortFromSearchParams(searchParams.get("sort")))
  }, [searchParams])

  useEffect(() => {
    syncFromUrl()
  }, [syncFromUrl])

  const pushRosterUrl = useCallback(
    (next: {
      search?: string
      filter?: PanelRosterFilter
      condition?: string
      sort?: PanelRosterSort
    }) => {
      const href = `/patients${buildPanelRosterSearchParams({
        search: next.search ?? searchQuery,
        filter: next.filter ?? rosterFilter,
        condition: next.condition ?? conditionFilter,
        sort: next.sort ?? sortBy,
      })}`
      router.replace(href)
    },
    [router, searchQuery, rosterFilter, conditionFilter, sortBy]
  )

  const stats = useMemo(
    () => computePanelRosterStats(allPatients),
    [allPatients]
  )

  const conditions = [...new Set(allPatients.map((p) => p.condition))]

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const filtered = allPatients.filter((patient) => {
      const matchesSearch =
        !q ||
        patient.name.toLowerCase().includes(q) ||
        patient.diagnosis.toLowerCase().includes(q) ||
        patient.condition.toLowerCase().includes(q) ||
        formatPatientMrn(patient.id).includes(q)

      const matchesCondition =
        conditionFilter === "all" || patient.condition === conditionFilter

      const matchesQuick = matchesRosterFilter(patient, rosterFilter)

      return matchesSearch && matchesCondition && matchesQuick
    })

    return sortPanelPatients(filtered, sortBy)
  }, [allPatients, searchQuery, conditionFilter, rosterFilter, sortBy])

  function resetFilters() {
    router.replace("/patients")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Patient panel"
        description={`${stats.total} attributed members · Internal Medicine`}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search name, MRN, diagnosis…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      pushRosterUrl({ search: searchQuery })
                    }
                  }}
                  onBlur={() => {
                    if (searchQuery !== (searchParams.get("search") ?? "")) {
                      pushRosterUrl({ search: searchQuery })
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={conditionFilter}
                onValueChange={(value) => {
                  setConditionFilter(value)
                  pushRosterUrl({ condition: value })
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conditions</SelectItem>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  const sort = value as PanelRosterSort
                  setSortBy(sort)
                  pushRosterUrl({ sort })
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Sort: Risk</SelectItem>
                  <SelectItem value="lastVisit">Sort: Last visit</SelectItem>
                  <SelectItem value="name">Sort: Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {QUICK_FILTERS.map((f) => (
                  <Button
                    key={f.id}
                    type="button"
                    size="sm"
                    variant={rosterFilter === f.id ? "default" : "outline"}
                    onClick={() => {
                      setRosterFilter(f.id)
                      pushRosterUrl({ filter: f.id })
                    }}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Showing {filteredPatients.length} of {stats.total}
                {stats.urgent > 0 && (
                  <span className="text-destructive"> · {stats.urgent} urgent</span>
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Key metric</th>
                  <th className="pb-3 font-medium">Last visit</th>
                  <th className="pb-3 font-medium">Next visit</th>
                  <th className="pb-3 pr-2 pb-3 text-center font-medium">Open</th>
                  <th className="pb-3 font-medium">Adherence</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredPatients.map((patient) => {
                  const fullChart = isFullChartPatient(patient.id)
                  const location = formatPatientLocation(patient)
                  const payer = formatPayerShort(patient)
                  const rpm = patient.id === DEMO_VITA_PATIENT_ID
                  const openItems = getPatientOpenItems(
                    patient.id,
                    alerts,
                    inbox
                  )
                  const nextVisit = getPatientNextVisitLabel(
                    patient.id,
                    appointments
                  )
                  const hasOpenItems =
                    openItems.alertCount > 0 || openItems.taskCount > 0

                  return (
                    <tr
                      key={patient.id}
                      className={cn(
                        "border-b border-border last:border-0",
                        patient.status === "red" && "bg-destructive/[0.03]"
                      )}
                    >
                      <td className="py-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {patient.name}
                          </Link>
                          {rpm && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal"
                            >
                              RPM
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {patient.condition}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          MRN {formatPatientMrn(patient.id)}
                          {patient.dateOfBirth
                            ? ` · DOB ${patient.dateOfBirth}`
                            : ` · ${patient.age}y`}
                        </p>
                        {(location || payer) && (
                          <p className="text-xs text-muted-foreground">
                            {[location, payer].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 font-medium text-foreground">
                        {patient.keyMetric}
                      </td>
                      <td className="py-3.5 tabular-nums text-muted-foreground">
                        <div>{formatUsDateNumeric(patient.lastVisitDate)}</div>
                        <div className="text-xs">{patient.daysSinceVisit}d ago</div>
                      </td>
                      <td className="py-3.5 tabular-nums text-muted-foreground">
                        {nextVisit ? (
                          <>
                            <div className="font-medium text-foreground">
                              Today
                            </div>
                            <div className="text-xs">{nextVisit}</div>
                          </>
                        ) : (
                          <span className="text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        {hasOpenItems ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {openItems.alertCount > 0 && (
                              <Link
                                href="/alerts"
                                title={`${openItems.alertCount} active alert${
                                  openItems.alertCount === 1 ? "" : "s"
                                }`}
                                className="inline-flex rounded-md p-1 text-destructive transition-colors hover:bg-destructive/10"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Link>
                            )}
                            {openItems.taskCount > 0 && (
                              <Link
                                href="/alerts?tab=tasks"
                                title={`${openItems.taskCount} open task${
                                  openItems.taskCount === 1 ? "" : "s"
                                }`}
                                className="inline-flex rounded-md p-1 text-primary transition-colors hover:bg-primary/10"
                              >
                                <ClipboardList className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        ) : (
                          <span className="block text-center text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 tabular-nums">
                        <span
                          className={cn(
                            "font-medium",
                            patient.adherenceScore < 70 && "text-destructive",
                            patient.adherenceScore >= 70 &&
                              patient.adherenceScore < 85 &&
                              "text-[#B45309]",
                            patient.adherenceScore >= 85 && "text-foreground"
                          )}
                        >
                          {patient.adherenceScore}%
                        </span>
                      </td>
                      <td className="py-3.5">
                        <ClinicalStatusBadge status={patient.status} />
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/patients/${patient.id}`}>
                            <Button size="sm">Chart</Button>
                          </Link>
                          {fullChart && (
                            <Link href={`/patients/${patient.id}?brief=1`}>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Pre-visit brief"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/messages?patient=${patient.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Message patient"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredPatients.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  No patients match this view
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try clearing filters or search with a different term.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
