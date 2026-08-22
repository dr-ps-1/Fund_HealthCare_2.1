"use client"

import { Suspense } from "react"
import { DemoScriptCallout } from "@/components/demo/demo-script-callout"

function DemoScriptFallback() {
  return null
}

export function DoctorDemoScript() {
  return (
    <Suspense fallback={<DemoScriptFallback />}>
      <DemoScriptCallout />
    </Suspense>
  )
}
