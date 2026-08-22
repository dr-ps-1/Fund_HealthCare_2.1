"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Bell,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  MessageSquare,
  User,
  Users,
} from "lucide-react"
import { useClinicianDataOptional } from "@/components/providers/clinician-data-provider"
import { toLocalDateIso } from "@/lib/calendar"
import { cn } from "@/lib/utils"
import { notifyRouteChange } from "@/lib/route-overlay"

const menuItems = [
  { label: "Panel", href: "/doctor", icon: LayoutDashboard },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Analytics", href: "/analytics", icon: Activity },
  { label: "Messages", href: "/messages", icon: MessageSquare },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { calendarAppointments } = useClinicianDataOptional()
  const todayVisitCount = useMemo(() => {
    const today = toLocalDateIso()
    return calendarAppointments.filter(
      (appointment) => (appointment.appointmentDate ?? today) === today
    ).length
  }, [calendarAppointments])

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy text-brand-navy-foreground">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <span className="text-base font-semibold text-foreground">iHealth</span>
          <p className="text-[11px] text-muted-foreground">Clinician workspace</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/doctor" && pathname.startsWith(item.href)) ||
            (item.href === "/doctor" && pathname === "/doctor")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                notifyRouteChange()
                onNavigate?.()
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand-navy bg-brand-navy-muted text-brand-navy"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/calendar" && todayVisitCount > 0 && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums",
                    isActive
                      ? "bg-brand-navy text-brand-navy-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {todayVisitCount}
                </span>
              )}
            </Link>
          )
        })}

        <Link
          href="/profile"
          onClick={() => {
            notifyRouteChange()
            onNavigate?.()
          }}
          className={cn(
            "mt-auto flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/profile"
              ? "border-brand-navy bg-brand-navy-muted text-brand-navy"
              : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          Account
        </Link>
      </nav>
    </aside>
  )
}
