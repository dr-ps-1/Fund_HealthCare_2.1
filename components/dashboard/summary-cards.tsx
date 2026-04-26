"use client"

import Link from "next/link"
import { Users, AlertTriangle, Bell, Pill } from "lucide-react"
import { Card } from "@/components/ui/card"
import { dashboardStats } from "@/lib/mock-data"

const cards = [
  {
    title: "Total Patients",
    value: dashboardStats.totalPatients,
    icon: Users,
    href: "/patients",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "High-Risk Patients",
    value: dashboardStats.highRiskPatients,
    icon: AlertTriangle,
    href: "/patients?status=red",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    title: "Alerts Today",
    value: dashboardStats.alertsToday,
    icon: Bell,
    href: "/alerts",
    color: "text-[#F59E0B]",
    bgColor: "bg-[#F59E0B]/10",
  },
  {
    title: "Missed Medications",
    value: dashboardStats.missedMedications,
    icon: Pill,
    href: "/patients?filter=missed-meds",
    color: "text-[#6B7280]",
    bgColor: "bg-[#6B7280]/10",
  },
]

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.title} href={card.href}>
          <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-semibold text-foreground">{card.value}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
