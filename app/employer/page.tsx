"use client"

import { RoleShell } from "@/components/layout/role-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  employerWorkforce,
  employerHealthIndexSeries,
  employerSpendForecast,
  employerRiskGroups,
  formatUsd,
  formatPct,
} from "@/lib/b2b-mock-data"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { HeartPulse, AlertTriangle, ShieldAlert, TrendingDown } from "lucide-react"

const spendCompare = [
  {
    label: "Annual medical spend",
    without: employerSpendForecast.withoutProgram / 1_000_000,
    with: employerSpendForecast.withProgram / 1_000_000,
  },
]

function statusBadge(status: "healthy" | "at-risk" | "high-risk") {
  if (status === "healthy") {
    return (
      <Badge className="border-transparent bg-[#16A34A]/15 text-[#16A34A] hover:bg-[#16A34A]/15">
        Healthy
      </Badge>
    )
  }
  if (status === "at-risk") {
    return (
      <Badge className="border-transparent bg-[#F59E0B]/15 text-[#B45309] hover:bg-[#F59E0B]/15">
        At risk
      </Badge>
    )
  }
  return (
    <Badge variant="destructive">High risk</Badge>
  )
}

export default function EmployerDashboardPage() {
  return (
    <RoleShell role="employer">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Workforce Health Overview
          </h1>
          <p className="text-muted-foreground">
            {employerWorkforce.companyName} ·{" "}
            {employerWorkforce.employeesCovered.toLocaleString()} employees
            covered
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#16A34A]/10">
              <HeartPulse className="h-6 w-6 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Healthy</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatPct(employerWorkforce.healthyPct)}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F59E0B]/10">
              <AlertTriangle className="h-6 w-6 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">At risk</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatPct(employerWorkforce.atRiskPct)}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High risk</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatPct(employerWorkforce.highRiskPct)}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5 border-primary/20 bg-primary/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingDown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Program savings</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatUsd(employerSpendForecast.savings, true)}
              </p>
              <p className="text-xs text-muted-foreground">
                {employerSpendForecast.savingsPct}% vs baseline
              </p>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>12-month workforce health index</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={employerHealthIndexSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[60, 90]}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="index"
                      name="Health index"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={{ fill: "#2563EB" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spend forecast: with vs without program</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Without: </span>
                  <span className="font-semibold">
                    {formatUsd(employerSpendForecast.withoutProgram, true)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">With program: </span>
                  <span className="font-semibold text-[#16A34A]">
                    {formatUsd(employerSpendForecast.withProgram, true)}
                  </span>
                </div>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendCompare}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      tickFormatter={(v) => `$${v}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(1)}M`, ""]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="without"
                      name="Without program"
                      fill="#DC2626"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="with"
                      name="With iHealth"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Risk groups</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead className="text-right">Headcount</TableHead>
                  <TableHead className="text-right">Avg risk</TableHead>
                  <TableHead>Top drivers</TableHead>
                  <TableHead className="text-right">Projected cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employerRiskGroups.map((row) => (
                  <TableRow key={row.group}>
                    <TableCell className="font-medium">{row.group}</TableCell>
                    <TableCell className="text-right">
                      {row.headcount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.avgRiskScore}
                    </TableCell>
                    <TableCell className="max-w-[220px] text-muted-foreground">
                      {row.topDrivers}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatUsd(row.projectedCost, true)}
                    </TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleShell>
  )
}
