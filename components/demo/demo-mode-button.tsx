"use client"

import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resetDemoMode } from "@/lib/demo"
import { dismissOverlaysBeforeNavigate } from "@/lib/route-overlay"

interface DemoModeButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary"
  className?: string
}

export function DemoModeButton({
  variant = "outline",
  className,
}: DemoModeButtonProps) {
  const router = useRouter()

  function handleReset() {
    resetDemoMode()
    dismissOverlaysBeforeNavigate(() => router.push("/login"))
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleReset}
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      Demo Mode
    </Button>
  )
}
