"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = sessionStorage.getItem("isLoggedIn") === "true"
      if (!loggedIn) {
        router.replace("/login")
      } else {
        setChecked(true)
      }
    }
  }, [pathname, router])

  if (!checked) return null

  return <>{children}</>
}
