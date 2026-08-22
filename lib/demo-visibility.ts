"use client"

import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const DEMO_SCRIPT_KEY = "showDemoScript"
const DEMO_SCRIPT_HIDDEN_KEY = "hideDemoScript"

export function dismissDemoScript() {
  if (typeof window === "undefined") return
  sessionStorage.setItem(DEMO_SCRIPT_HIDDEN_KEY, "1")
}

export function useDemoScriptVisible(
  source: "mock" | "supabase" | "loading",
  loading = false
) {
  const searchParams = useSearchParams()
  const [forced, setForced] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (searchParams.get("demo") === "1") {
      sessionStorage.setItem(DEMO_SCRIPT_KEY, "1")
      sessionStorage.removeItem(DEMO_SCRIPT_HIDDEN_KEY)
      setForced(true)
      setHidden(false)
      setReady(true)
      return
    }

    setForced(sessionStorage.getItem(DEMO_SCRIPT_KEY) === "1")
    setHidden(sessionStorage.getItem(DEMO_SCRIPT_HIDDEN_KEY) === "1")
    setReady(true)
  }, [searchParams])

  const dismiss = useCallback(() => {
    dismissDemoScript()
    setHidden(true)
  }, [])

  const settled = ready && !loading && source !== "loading"
  const show = settled && !hidden && (source === "mock" || forced)

  return { show, dismiss }
}
