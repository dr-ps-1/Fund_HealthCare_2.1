"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HeartPulse } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { pinDemoClock } from "@/lib/demo-clock"

const VALID_EMAIL = "sarah.wilson@clinic.com"
const VALID_PASSWORD = "123"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      router.replace("/doctor")
    }
  }, [router])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setLoading(true)
      pinDemoClock(new Date())
      sessionStorage.setItem("isLoggedIn", "true")
      sessionStorage.setItem("userEmail", email)
      sessionStorage.setItem("demoRole", "doctor")
      router.push("/doctor")
      return
    }

    setError("Invalid email or password.")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-brand-navy-foreground">
            <HeartPulse className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            iHealth Clinician
          </p>
          <h1 className="text-center text-2xl font-bold text-foreground">
            Clinician workspace
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            Sign in to access your attributed panel, alerts, and secure messaging.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah.wilson@clinic.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo:{" "}
          <span className="font-medium text-foreground">sarah.wilson@clinic.com</span> /{" "}
          <span className="font-medium text-foreground">123</span>
        </p>
      </div>
    </div>
  )
}
