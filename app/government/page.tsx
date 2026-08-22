"use client"

import { RoleShell } from "@/components/layout/role-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  governmentRiskZones,
  governmentZipHeatmap,
  governmentBudgetForecast,
  formatUsd,
  type RiskZone,
} from "@/lib/b2b-mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

function riskLevelBadge(level: RiskZone["riskLevel"]) {
  const styles: Record<RiskZone["riskLevel"], string> = {
    low: "border-transparent bg-[#16A34A]/15 text-[#16A34A] hover:bg-[#16A34A]/15",
    moderate:
      "border-transparent bg-[#F59E0B]/15 text-[#B45309] hover:bg-[#F59E0B]/15",
    high: "border-transparent bg-[#EA580C]/15 text-[#C2410C] hover:bg-[#EA580C]/15",
    critical: "border-transparent bg-destructive text-destructive-foreground",
  }
  const labels: Record<RiskZone["riskLevel"], string> = {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    critical: "Critical",
  }
  return <Badge className={styles[level]}>{labels[level]}</Badge>
}

function heatCellClass(level: RiskZone["riskLevel"]) {
  return cn(
    "flex flex-col items-center justify-center rounded-md border p-3 text-center transition-shadow hover:shadow-sm",
    level === "critical" && "border-destructive/40 bg-destructive/20",
    level === "high" && "border-[#EA580C]/40 bg-[#EA580C]/15",
    level === "moderate" && "border-[#F59E0B]/40 bg-[#F59E0B]/15",
    level === "low" && "border-[#16A34A]/40 bg-[#16A34A]/15"
  )
}

const budgetChartData = governmentBudgetForecast.map((row) => ({
  service: row.service.replace(" & ", " &\n"),
  short: row.service.split(" ")[0],
  current: Math.round(row.fyCurrent / 1_000_000),
  forecast: Math.round(row.fyForecast / 1_000_000),
}))

function priorityBadge(priority: "expand" | "maintain" | "optimize") {
  if (priority === "expand") {
    return (
      <Badge className="border-transparent bg-primary/15 text-primary hover:bg-primary/15">
        Expand
      </Badge>
    )
  }
  if (priority === "optimize") {
    return (
      <Badge className="border-transparent bg-[#16A34A]/15 text-[#16A34A] hover:bg-[#16A34A]/15">
        Optimize ↓
      </Badge>
    )
  }
  return <Badge variant="secondary">Maintain</Badge>
}

export default function GovernmentDashboardPage() {
  return (
    <RoleShell role="government">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Public Health Prevention
          </h1>
          <p className="text-muted-foreground">
            Florida risk zones · ZIP heat overview · Budget by service
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                ZIP risk heatmap
              </CardTitle>
              <CardDescription>
                South Florida focus — ZIP risk grid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-destructive/40" /> Critical
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-[#EA580C]/40" /> High
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-[#F59E0B]/40" /> Moderate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-[#16A34A]/40" /> Low
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {governmentZipHeatmap.map((cell) => (
                  <div
                    key={cell.zip}
                    className={heatCellClass(cell.riskLevel)}
                    title={`${cell.label} · score ${cell.riskScore}`}
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {cell.zip}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                      {cell.label}
                    </span>
                    <span className="mt-1 text-sm font-bold text-foreground">
                      {cell.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-muted-foreground/30 bg-muted/30">
            <CardHeader>
              <CardTitle>Geographic overview</CardTitle>
              <CardDescription>
                County / ZIP choropleth can plug in here without changing the grid
                or budget views below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/60 text-center">
                <MapPin className="mb-2 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  Interactive FL county / ZIP map
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Use the ZIP heatmap grid and risk zones table for the live
                  walkthrough.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top risk zones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>County</TableHead>
                  <TableHead>ZIP</TableHead>
                  <TableHead className="text-right">Population</TableHead>
                  <TableHead className="text-right">Risk score</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Top condition</TableHead>
                  <TableHead className="text-right">Preventable events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {governmentRiskZones.map((zone) => (
                  <TableRow key={`${zone.county}-${zone.zip}`}>
                    <TableCell className="font-medium">{zone.county}</TableCell>
                    <TableCell>{zone.zip}</TableCell>
                    <TableCell className="text-right">
                      {zone.population.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{zone.riskScore}</TableCell>
                    <TableCell>{riskLevelBadge(zone.riskLevel)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {zone.topCondition}
                    </TableCell>
                    <TableCell className="text-right">
                      {zone.preventableEvents}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Budget forecast by service ($M)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetChartData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      type="number"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      tickFormatter={(v) => `$${v}M`}
                    />
                    <YAxis
                      type="category"
                      dataKey="short"
                      width={88}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value}M`, ""]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="current"
                      name="FY current"
                      fill="#6B7280"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="forecast"
                      name="FY forecast"
                      fill="#2563EB"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget detail</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Forecast</TableHead>
                    <TableHead className="text-right">Δ</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {governmentBudgetForecast.map((row) => (
                    <TableRow key={row.service}>
                      <TableCell className="max-w-[140px] font-medium">
                        {row.service}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatUsd(row.fyCurrent, true)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatUsd(row.fyForecast, true)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          row.deltaPct < 0
                            ? "text-[#16A34A]"
                            : "text-foreground"
                        )}
                      >
                        {row.deltaPct > 0 ? "+" : ""}
                        {row.deltaPct}%
                      </TableCell>
                      <TableCell>{priorityBadge(row.priority)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleShell>
  )
}
