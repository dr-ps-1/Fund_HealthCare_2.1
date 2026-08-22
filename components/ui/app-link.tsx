"use client"

import Link from "next/link"
import type { ComponentProps } from "react"
import { notifyRouteChange } from "@/lib/route-overlay"

/** Next.js Link that closes Radix overlays before client navigation. */
export function AppLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        notifyRouteChange()
        onClick?.(event)
      }}
    />
  )
}
