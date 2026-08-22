"use client"

import { useState } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  insurancePortfolioForecast,
  insuranceClaimsTrend,
  insuranceRiskSegments,
  insuranceTopEarlyDetection,
  insuranceProgramRoi,
  formatUsd,
  type ForecastHorizon,
} from "@/lib/b2b-mock-data"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

function roiStatusBadge(status: "scaling" | "pilot" | "mature") {
  if (status === "mature") {
    return (
      <Badge className="border-transparent bg-[#16A34A]/15 text-[#16A34A] hover:bg-[#16A34A]/15">
        Mature
      </Badge>
    )
  }
  if (status === "scaling") {
    return (
      <Badge className="border-transparent bg-primary/15 text-primary hover:bg-primary/15">
        Scaling
      </Badge>
    )
  }
  return (
    <Badge className="border-transparent bg-[#F59E0B]/15 text-[#B45309] hover:bg-[#F59E0B]/15">
      Pilot
    </Badge>
  )
}

export default function InsuranceDashboardPage() {
  const [horizon, setHorizon] = useState<ForecastHorizon>(12)
  const scenarios = insurancePortfolioForecast[horizon]

  return (
    <RoleShell role="insurance">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Portfolio Risk & Program ROI
            </h1>
            <p className="text-muted-foreground">
              Multi-scenario claims forecast · Early detection impact
            </p>
          </div>
          <Select
            value={String(horizon)}
            onValueChange={(v) => setHorizon(Number(v) as ForecastHorizon)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Horizon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
              <SelectItem value="24">24 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {scenarios.map((s) => (
            <Card key={s.name} className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {s.name}
                </p>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
              </div>
              <p className="text-2xl font-semibold text-foreground">
                ${s.claimsPmpm}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  PMPM
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Loss ratio {(s.lossRatio * 100).toFixed(0)}% ·{" "}
                {s.membersAtRisk.toLocaleString()} at risk
              </p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Claims PMPM — scenario trajectories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insuranceClaimsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[320, 580]}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Baseline"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={{ fill: "#2563EB" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="optimistic"
                      name="Optimistic"
                      stroke="#16A34A"
                      strokeWidth={2}
                      dot={{ fill: "#16A34A" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pessimistic"
                      name="Pessimistic"
                      stroke="#DC2626"
                      strokeWidth={2}
                      dot={{ fill: "#DC2626" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio risk segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={insuranceRiskSegments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {insuranceRiskSegments.map((entry, index) => (
                        <Cell key={`seg-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Share"]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 early detection clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Cases detected</TableHead>
                  <TableHead className="text-right">Avoided cost</TableHead>
                  <TableHead className="text-right">Lead time (days)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insuranceTopEarlyDetection.map((row) => (
                  <TableRow key={row.rank}>
                    <TableCell className="font-medium">{row.rank}</TableCell>
                    <TableCell className="font-medium">{row.client}</TableCell>
                    <TableCell className="text-right">
                      {row.members.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.casesDetected}
                    </TableCell>
                    <TableCell className="text-right text-[#16A34A]">
                      {formatUsd(row.avoidedCost, true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.leadTimeDays}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead className="text-right">Enrolled</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insuranceProgramRoi.map((row) => (
                  <TableRow key={row.program}>
                    <TableCell className="font-medium">{row.program}</TableCell>
                    <TableCell className="text-right">
                      {row.enrolled.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatUsd(row.cost, true)}
                    </TableCell>
                    <TableCell className="text-right text-[#16A34A]">
                      {formatUsd(row.savings, true)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {row.roi.toFixed(1)}x
                    </TableCell>
                    <TableCell>{roiStatusBadge(row.status)}</TableCell>
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
