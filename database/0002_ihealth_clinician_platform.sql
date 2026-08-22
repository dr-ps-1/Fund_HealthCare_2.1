-- iHealth 2.1 clinician platform tables (Fund_HealthCare — do not mix with Vita patient portal schema)
-- Run after 0001_clinician_patient_messages.sql in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- ─── Clinicians ───────────────────────────────────────────────────────────────

create table if not exists clinicians (
  id text primary key,
  name text not null,
  specialization text not null,
  npi text not null,
  email text not null,
  phone text not null,
  photo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Attributed panel (9 demo patients — owned by iHealth, not Vita patients UUID) ──

create table if not exists clinician_panel_patients (
  id text primary key,
  clinician_id text not null references clinicians(id) on delete cascade,
  name text not null,
  age integer not null check (age >= 0),
  photo text not null default '',
  condition text not null,
  diagnosis text not null,
  risk_score integer not null check (risk_score between 0 and 100),
  status text not null check (status in ('green', 'yellow', 'red')),
  last_activity text not null,
  adherence_score integer not null check (adherence_score between 0 and 100),
  days_since_visit integer not null check (days_since_visit >= 0),
  last_visit_date text not null,
  icd_codes jsonb not null default '[]'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  allergies jsonb not null default '[]'::jsonb,
  key_metric text not null,
  city text,
  state text,
  zip text,
  date_of_birth text,
  insurance_payer text,
  insurance_plan text,
  member_id text,
  last_awv_date text,
  tier text not null default 'panel-only' check (tier in ('star', 'vita-linked', 'panel-only')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clinician_panel_patients_clinician_idx
  on clinician_panel_patients (clinician_id, sort_order);

-- ─── Clinical alerts ──────────────────────────────────────────────────────────

create table if not exists clinician_alerts (
  id text primary key,
  clinician_id text not null references clinicians(id) on delete cascade,
  patient_id text not null,
  patient_name text not null,
  alert_type text not null check (alert_type in ('vitals', 'behavior', 'ai')),
  severity text not null check (severity in ('high', 'medium', 'low')),
  headline text not null,
  cause text not null,
  metric text,
  time_label text not null,
  status text not null default 'active' check (status in ('active', 'resolved')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clinician_alerts_clinician_status_idx
  on clinician_alerts (clinician_id, status, sort_order);

-- ─── Physician inbox tasks ────────────────────────────────────────────────────

create table if not exists clinician_inbox_tasks (
  id text primary key,
  clinician_id text not null references clinicians(id) on delete cascade,
  kind text not null check (kind in ('lab', 'message', 'refill', 'referral', 'prior_auth')),
  title text not null,
  patient_id text not null,
  patient_name text not null,
  priority text not null check (priority in ('high', 'medium')),
  time_label text not null,
  href text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists clinician_inbox_tasks_clinician_idx
  on clinician_inbox_tasks (clinician_id, sort_order);

-- ─── Today's schedule ─────────────────────────────────────────────────────────

create table if not exists clinician_appointments (
  id text primary key,
  clinician_id text not null references clinicians(id) on delete cascade,
  appointment_time text not null,
  patient_id text not null,
  patient_name text not null,
  appointment_type text not null,
  reason text not null,
  location text not null,
  is_next boolean not null default false,
  rpm_connected boolean not null default false,
  href text not null,
  sort_order integer not null default 0,
  appointment_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists clinician_appointments_clinician_date_idx
  on clinician_appointments (clinician_id, appointment_date, sort_order);

-- ─── Chart notes (doctor writes on patient chart) ─────────────────────────────

create table if not exists clinician_chart_notes (
  id uuid primary key default gen_random_uuid(),
  clinician_id text not null references clinicians(id) on delete cascade,
  patient_id text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists clinician_chart_notes_patient_idx
  on clinician_chart_notes (patient_id, created_at desc);

-- ─── Patient timeline events ──────────────────────────────────────────────────

create table if not exists clinician_timeline_events (
  id text primary key,
  patient_id text not null,
  event_type text not null check (event_type in ('symptom', 'device', 'ai', 'visit', 'note')),
  event_date text not null,
  headline text not null,
  description text not null,
  full_text text,
  attachments jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists clinician_timeline_events_patient_idx
  on clinician_timeline_events (patient_id, sort_order);

-- ─── AI summary cards on chart ────────────────────────────────────────────────

create table if not exists clinician_ai_summaries (
  patient_id text primary key,
  title text not null,
  insights jsonb not null default '[]'::jsonb,
  generated_at text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
