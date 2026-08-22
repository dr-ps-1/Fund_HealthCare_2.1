"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ClinicianDataStatus } from "@/components/layout/clinician-data-status"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { notifyRouteChange } from "@/lib/route-overlay"
import { cn } from "@/lib/utils"

export function ClinicianShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isFirstPath = useRef(true)

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false
      return
    }
    notifyRouteChange()
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Sidebar />}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <div className={cn(!isMobile && "ml-64")}>
        {isMobile && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="fixed left-3 top-3 z-40 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Header />
        <main className="pt-16">
          <ClinicianDataStatus />
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
