# Database migrations

SQL for the clinician workspace, applied to the **shared Supabase project** with Vita AI. Do not mix these tables with the Vita patient-portal schema.

## Apply

1. Copy values from Vita `.env.local` into this app’s `.env` / `.env.local`.
2. Run in order, either in the Supabase SQL Editor or:

```bash
pnpm run db:apply-ihealth-migrations
```

| File | What it creates |
|---|---|
| `0001_clinician_patient_messages.sql` | Secure clinician ↔ patient messages |
| `0002_ihealth_clinician_platform.sql` | Panel, alerts, inbox, appointments, timeline, AI summaries |

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_DB_PASSWORD`.

Without Supabase, the app runs on in-memory mock data.
