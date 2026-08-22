"use client"

import { formatUsDateTime, demoNow } from "@/lib/demo-clock"

export function AsOfBadge({ className }: { className?: string }) {
  const label = formatUsDateTime(demoNow())
  return (
    <p
      className={
        className ??
        "inline-flex items-center rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
      }
    >
      Dashboard as of {label}
    </p>
  )
}
