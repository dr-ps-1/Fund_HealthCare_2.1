"use client"

import Link from "next/link"
import { ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DemoModeButton } from "@/components/demo/demo-mode-button"
import { roleLabels, type DemoRole } from "@/lib/demo"

interface RoleShellProps {
  role: DemoRole
  children: React.ReactNode
}

export function RoleShell({ role, children }: RoleShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              iHealth Platform
            </p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[role]} view
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/future/roles">
            <Button variant="ghost" size="sm">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Switch role
            </Button>
          </Link>
          <DemoModeButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
    </div>
  )
}
