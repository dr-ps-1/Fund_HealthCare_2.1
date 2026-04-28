"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: "/5.1 Public Health Prevention.png",
  },
  {
    label: "Patients",
    href: "/patients",
    icon: "/2.1 Remote Patient Monitoring System.png",
  },
  {
    label: "Provider Search",
    href: "/providers",
    icon: "/5.3 Fraud&Integrity Layer.png",
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: "/3.2 Fraud signals& Investigation Prioritization.png",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "/1.2 Review Your Treatment & Get Clarity.png",
  },
  {
    label: "Messages",
    href: "/messages",
    icon: "/2.2 AI Documentation & Coding Assistant (1).png",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <Image
          src="/1.1 AI Health Assistant.png"
          alt="AI Health Assistant"
          width={36}
          height={36}
          className="shrink-0"
        />
        <span className="text-base font-semibold text-foreground leading-tight">
          AI Health Monitor
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                height={20}
                className={cn(
                  "shrink-0",
                  isActive ? "brightness-0 invert" : ""
                )}
              />
              {item.label}
            </Link>
          )
        })}

        {/* Profile — no matching product icon */}
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <User className="h-5 w-5 shrink-0" />
          Profile
        </Link>
      </nav>
    </aside>
  )
}
