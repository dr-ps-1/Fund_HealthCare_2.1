"use client"

import { useEffect, useState } from "react"

/** Live wall-clock time for UI chrome (greeting, today's date). Updates every minute. */
export function useWallClock(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const intervalId = window.setInterval(tick, 60_000)
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return now
}
