"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

const patientDistributionData = [
  { name: "Diabetes", count: 85, color: "#2563EB" },
  { name: "Cardiovascular", count: 62, color: "#DC2626" },
  { name: "COPD", count: 45, color: "#F59E0B" },
  { name: "Hypertension", count: 56, color: "#16A34A" },
]

const riskTrendsData = [
  { month: "Jan", high: 8, medium: 15, low: 22 },
  { month: "Feb", high: 10, medium: 18, low: 20 },
  { month: "Mar", high: 12, medium: 16, low: 18 },
  { month: "Apr", high: 9, medium: 20, low: 21 },
  { month: "May", high: 11, medium: 17, low: 19 },
  { month: "Jun", high: 14, medium: 19, low: 17 },
]

const alertsOverTimeData = [
  { week: "Week 1", vitals: 12, behavior: 8, ai: 5 },
  { week: "Week 2", vitals: 15, behavior: 10, ai: 8 },
  { week: "Week 3", vitals: 10, behavior: 6, ai: 12 },
  { week: "Week 4", vitals: 18, behavior: 9, ai: 7 },
]

const statusDistributionData = [
  { name: "Stable", value: 180, color: "#16A34A" },
  { name: "Caution", value: 45, color: "#F59E0B" },
  { name: "Critical", value: 23, color: "#DC2626" },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [conditionFilter, setConditionFilter] = useState("all")

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Patient data insights and trends
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="diabetes">Diabetes</SelectItem>
                <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                <SelectItem value="copd">COPD</SelectItem>
                <SelectItem value="hypertension">Hypertension</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient Distribution by Condition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {patientDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
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

          <Card>
            <CardHeader>
              <CardTitle>Risk Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
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
                      dataKey="high"
                      name="High Risk"
                      stroke="#DC2626"
                      strokeWidth={2}
                      dot={{ fill: "#DC2626" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="medium"
                      name="Medium Risk"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ fill: "#F59E0B" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="low"
                      name="Low Risk"
                      stroke="#16A34A"
                      strokeWidth={2}
                      dot={{ fill: "#16A34A" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={alertsOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="vitals"
                      name="Vitals"
                      fill="#DC2626"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="behavior"
                      name="Behavior"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="ai"
                      name="AI"
                      fill="#2563EB"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
