-- iHealth 2.1 clinician ↔ patient secure messaging (shared Supabase project with Vita AI)
-- Run in Supabase SQL Editor or: pnpm run db:apply-ihealth-migrations

create extension if not exists "pgcrypto";

create table if not exists clinician_patient_messages (
  id uuid primary key default gen_random_uuid(),
  demo_patient_id text not null,
  patient_name text not null,
  patient_photo text not null default '',
  content text not null,
  is_from_doctor boolean not null default false,
  sent_at timestamptz not null default now()
);

create index if not exists clinician_patient_messages_patient_sent_idx
  on clinician_patient_messages (demo_patient_id, sent_at);

create table if not exists clinician_message_read_state (
  clinician_id text not null default 'demo-wilson',
  demo_patient_id text not null,
  read_at timestamptz not null default now(),
  primary key (clinician_id, demo_patient_id)
);
