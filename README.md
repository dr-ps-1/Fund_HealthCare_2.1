# AVB Provider Search — Healthcare Dashboard

An AI-powered patient monitoring and provider search dashboard for healthcare professionals. Built as a demonstration platform for fund healthcare initiatives across New York State.

## Features

- **Secure Patient Portal** — login page with session-based auth guard; all routes are protected
- **Patient Monitoring** — real-time risk scores, alerts, timelines, and AI-generated summaries
- **Provider Search** — search by NPI number, provider name, or organization with regional and specialty filters
- **Risk Indicators** — visual risk markers based on billing code usage frequency
- **Messaging** — direct communication between doctors and patients

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, React 19
- [TypeScript](https://www.typescriptlang.org) 5.7
- [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com)
- [Lucide React](https://lucide.dev) icons

## Getting Started

**Prerequisites:** Node.js 18+ and [pnpm](https://pnpm.io)

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the login page.

**Demo credentials:** `sarah.wilson@clinic.com` / `123`

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |

## Auth Flow

Authentication is client-side and session-based (no backend). On login, `sessionStorage.isLoggedIn` is set to `true`. The `AuthGuard` component in `AppShell` redirects unauthenticated users to `/login` on every route. Sign out clears the session and returns to `/login`.

## Branding

Product-specific PNG icons are served from `public/` and mapped to sidebar sections by semantic meaning:

| Section | Icon |
|---|---|
| Dashboard | 5.1 Public Health Prevention |
| Patients | 2.1 Remote Patient Monitoring System |
| Provider Search | 5.3 Fraud & Integrity Layer |
| Alerts | 3.2 Fraud Signals & Investigation |
| Analytics | 1.2 Review Your Treatment & Get Clarity |
| Messages | 2.2 AI Documentation & Coding Assistant |
| Sidebar logo | 1.1 AI Health Assistant |
