/** Fired before/alongside client navigations to close Radix overlays safely. */
export const ROUTE_CHANGE_EVENT = "ihealth:route-change"

export function notifyRouteChange() {
  if (typeof document !== "undefined") {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT))
  }
}

/** Blur focus, close overlays, then navigate on the next tick. */
export function dismissOverlaysBeforeNavigate(navigate: () => void) {
  notifyRouteChange()
  window.setTimeout(navigate, 0)
}
