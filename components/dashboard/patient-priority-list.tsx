"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export function PatientPriorityList() {
  const priorityPatients = [...patients]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Patient Priority List</CardTitle>
        <Link href="/patients">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Risk Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Last Update</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {priorityPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {patient.name}
                    </Link>
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "font-semibold",
                        patient.riskScore >= 70 && "text-destructive",
                        patient.riskScore >= 40 && patient.riskScore < 70 && "text-[#F59E0B]",
                        patient.riskScore < 40 && "text-[#16A34A]"
                      )}
                    >
                      {patient.riskScore}
                    </span>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={patient.status} />
                  </td>
                  <td className="py-3 text-muted-foreground">{patient.lastActivity}</td>
                  <td className="py-3">
                    <Link href={`/patients/${patient.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
