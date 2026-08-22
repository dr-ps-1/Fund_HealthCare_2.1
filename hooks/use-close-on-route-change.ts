"use client"

import { useEffect } from "react"
import { ROUTE_CHANGE_EVENT } from "@/lib/route-overlay"

/** Close dialogs/menus when the app navigates to another route. */
export function useCloseOnRouteChange(
  onClose: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return
    const handler = () => onClose()
    window.addEventListener(ROUTE_CHANGE_EVENT, handler)
    return () => window.removeEventListener(ROUTE_CHANGE_EVENT, handler)
  }, [onClose, enabled])
}
