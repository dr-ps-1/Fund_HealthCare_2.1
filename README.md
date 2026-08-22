# iHealth Platform

Clinician workspace for attributed-panel management: roster, alerts, calendar, visit prep, messaging, and population views. Built as a **demonstration** platform — not production EHR software.

Entry: `/` → `/login` → `/doctor`.

## Features

- **Clinician panel** — roster, risk, visit gaps, quality signals
- **Visit prep** — AI pre-visit brief (Groq when configured, otherwise mock)
- **Alerts & inbox** — workqueue for the attributed panel
- **Calendar** — today’s visits and scheduling
- **Secure messaging** — clinician ↔ patient threads (mock or Supabase)
- **Provider search** — NPI / name / organization
- **B2B shells** — employer, insurance, and government demos at `/employer`, `/insurance`, `/government`

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- TypeScript 5.7, Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com)
- Optional: [Groq](https://console.groq.com) for AI briefs, [Supabase](https://supabase.com) for persistence

## Getting started

**Prerequisites:** Node.js 18+ and [pnpm](https://pnpm.io)

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Description |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Typecheck (`tsc --noEmit`) |
| `pnpm run db:apply-ihealth-migrations` | Apply SQL in `database/` |

### Environment

See `.env.example`. Never commit `.env` or `.env.local`.

- **`GROQ_API_KEY`** — optional. Without it, Patient Assistant and Pre-visit Brief use mock fallbacks.
- **Supabase** — optional. Copy the same project URL and keys used by Vita AI. See `database/README.md`. Without it, the clinician panel stays on mock data.
- **`NEXT_PUBLIC_VITA_PATIENT_URL`** — Vita patient portal (module 1.1). Default if unset: `http://localhost:3001/dashboard`. Set empty to use the built-in demo at `/patient/local` only.

## Demo login

This app uses **client-side session auth only** (`sessionStorage`). There is no server-side identity check on API routes.

**Credentials:** `sarah.wilson@clinic.com` / `123`

Do not deploy this build to the public internet with real patient data, a live Groq key, or a production Supabase project. Demo patients in `shared-data/` and `public/demo/` are synthetic.

## Auth model

On login, `sessionStorage.isLoggedIn` is set. `AuthGuard` redirects the UI to `/login`. Sign out clears the session. This is sufficient for a local/demo walkthrough, not for HIPAA production.
