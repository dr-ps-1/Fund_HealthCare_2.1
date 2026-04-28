"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const VALID_EMAIL = "sarah.wilson@clinic.com"
const VALID_PASSWORD = "123"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setLoading(true)
      sessionStorage.setItem("isLoggedIn", "true")
      sessionStorage.setItem("userEmail", email)
      router.push("/")
    } else {
      setError("Invalid email or password.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <Image
            src="/1.1 AI Health Assistant.png"
            alt="AI Health Assistant"
            width={64}
            height={64}
          />
          <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase">
            AI Patient Health Assistant
          </p>
          <h1 className="text-2xl font-bold text-slate-800 text-center">
            Secure Patient Portal
          </h1>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Sign in with your patient account to continue your clinical intake
            and review your health data.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@demo.com"
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 text-sm transition"
          >
            {loading ? "Signing in…" : "Log in to Portal"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">or continue with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Social buttons (stubs) */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2.5 w-full rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-sm font-medium text-slate-700 transition"
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-black hover:bg-neutral-800 py-2.5 text-sm font-medium text-white transition"
          >
            {/* Apple icon */}
            <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.44 9.59c-.022-2.257 1.845-3.349 1.929-3.402-1.052-1.537-2.686-1.748-3.27-1.773-1.393-.141-2.72.822-3.425.822-.703 0-1.79-.8-2.944-.778C4.16 4.481 2.658 5.41 1.837 6.84.154 9.74 1.44 14.05 3.065 16.41c.806 1.157 1.76 2.454 3.015 2.406 1.213-.048 1.668-.782 3.133-.782 1.463 0 1.88.782 3.149.757 1.304-.023 2.126-1.18 2.924-2.343a11.37 11.37 0 0 0 1.334-2.7c-.03-.013-2.554-.977-2.58-3.858zM11.17 3.03C11.83 2.22 12.28 1.1 12.15 0c-.944.04-2.092.63-2.77 1.426-.607.697-1.142 1.83-.998 2.91 1.055.08 2.133-.535 2.788-1.306z"/>
            </svg>
            Sign in with Apple
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-black hover:bg-neutral-800 py-2.5 text-sm font-medium text-white transition"
          >
            {/* X icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.294 6.928 14.761 0h-1.294L8.7 6.088 4.678 0H0l5.737 8.342L0 15.573h1.294l5.015-5.833 4.006 5.833H16L9.294 6.928zm-1.776 2.065-.581-.831L1.76.987h1.99l3.731 5.337.581.831 4.851 6.937h-1.99L7.518 8.993z"/>
            </svg>
            Sign in with X
          </button>
        </div>

        {/* Demo hint */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Demo credentials:{" "}
          <span className="text-teal-600 font-medium">sarah.wilson@clinic.com</span>
          {" "}/ <span className="text-teal-600 font-medium">123</span>
        </p>
      </div>
    </div>
  )
}
