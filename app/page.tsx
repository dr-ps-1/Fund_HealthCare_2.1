"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

/** Product entry: login, or the panel if the clinician session is already open. */
export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true"
    router.replace(loggedIn ? "/doctor" : "/login")
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Opening clinician workspace…</p>
    </div>
  )
}
