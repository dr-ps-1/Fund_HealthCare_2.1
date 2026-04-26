"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MessageSquare } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { patients } from "@/lib/mock-data"
import type { PatientStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

function StatusBadge({ status }: { status: PatientStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 w-6 rounded-full p-0",
        status === "green" && "border-[#16A34A] bg-[#16A34A]",
        status === "yellow" && "border-[#F59E0B] bg-[#F59E0B]",
        status === "red" && "border-destructive bg-destructive"
      )}
    >
      <span className="sr-only">{status}</span>
    </Badge>
  )
}

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || patient.status === statusFilter
    const matchesCondition =
      conditionFilter === "all" ||
      patient.condition.toLowerCase().includes(conditionFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesCondition
  })

  const conditions = [...new Set(patients.map((p) => p.condition))]

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your patients
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition.toLowerCase()}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Condition</th>
                    <th className="pb-3 font-medium">Risk</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Last Activity</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-4">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {patient.name}
                        </Link>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {patient.condition}
                      </td>
                      <td className="py-4">
                        <span
                          className={cn(
                            "font-semibold",
                            patient.riskScore >= 70 && "text-destructive",
                            patient.riskScore >= 40 &&
                              patient.riskScore < 70 &&
                              "text-[#F59E0B]",
                            patient.riskScore < 40 && "text-[#16A34A]"
                          )}
                        >
                          {patient.riskScore}
                        </span>
                      </td>
                      <td className="py-4">
                        <StatusBadge status={patient.status} />
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {patient.lastActivity}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/patients/${patient.id}`}>
                            <Button size="sm">View</Button>
                          </Link>
                          <Link href={`/messages?patient=${patient.id}`}>
                            <Button size="sm" variant="ghost">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPatients.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No patients found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
