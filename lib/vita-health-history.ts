import { DEMO_VITA_PATIENT_ID } from "@/lib/demo-patients"
import {
  dateFromOffset,
  demoNow,
  formatUsDate,
  type DateOffset,
} from "@/lib/demo-clock"

export type VitaHistoryKind = "check-in" | "lab" | "onboarding"

export type VitaHistoryMetric = {
  label: string
  value: string
}

export type VitaHistoryEvent = {
  id: string
  patientId: string
  kind: VitaHistoryKind
  date: string
  title: string
  summary: string
  metrics: VitaHistoryMetric[]
}

export type VitaHistoryPeriod = "7d" | "14d" | "30d" | "all"

export const VITA_HISTORY_PERIODS: {
  value: VitaHistoryPeriod
  label: string
}[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All history" },
]

const PERIOD_DAYS: Record<Exclude<VitaHistoryPeriod, "all">, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
}

type HistoryTemplate = Omit<VitaHistoryEvent, "date"> & {
  dateOffset: DateOffset
}

/** Vita Health Timeline feed for Ava Jackson (RPM / module 1.1). */
const avaHistoryTemplates: HistoryTemplate[] = [
  {
    id: "vita-ava-1",
    patientId: DEMO_VITA_PATIENT_ID,
    kind: "check-in",
    dateOffset: { hoursAgo: 6 },
    title: "Daily check-in",
    summary:
      "Feeling 3/5. BP 152/88. Sleep 6.5h. Pulse 82 bpm. Weight 72.1 kg.",
    metrics: [
      { label: "BP", value: "152/88" },
      { label: "Pulse", value: "82 bpm" },
      { label: "Sleep", value: "6.5h" },
      { label: "Feeling", value: "3/5" },
      { label: "Weight", value: "72.1 kg" },
    ],
  },
  {
    id: "vita-ava-2",
    patientId: DEMO_VITA_PATIENT_ID,
    kind: "check-in",
    dateOffset: { daysAgo: 2, hour: 20, minute: 16 },
    title: "Daily check-in",
    summary:
      "Feeling 4/5. BP 146/90. Sleep 7h. Pulse 78 bpm. Glucose 108 mg/dL. Weight 72.0 kg.",
    metrics: [
      { label: "BP", value: "146/90" },
      { label: "Sleep", value: "7h" },
      { label: "Pulse", value: "78 bpm" },
      { label: "Glucose", value: "108" },
      { label: "Weight", value: "72.0 kg" },
    ],
  },
  {
    id: "vita-ava-3",
    patientId: DEMO_VITA_PATIENT_ID,
    kind: "check-in",
    dateOffset: { daysAgo: 5, hour: 8, minute: 16 },
    title: "Daily check-in",
    summary:
      "Feeling 3/5. BP 138/86. Sleep 7.5h. Pulse 76 bpm. Weight 72.2 kg.",
    metrics: [
      { label: "BP", value: "138/86" },
      { label: "Sleep", value: "7.5h" },
      { label: "Pulse", value: "76 bpm" },
      { label: "Weight", value: "72.2 kg" },
    ],
  },
  {
    id: "vita-ava-4",
    patientId: DEMO_VITA_PATIENT_ID,
    kind: "check-in",
    dateOffset: { daysAgo: 15, hour: 20, minute: 16 },
    title: "Daily check-in",
    summary:
      "Feeling 3/5. BP 125/93. Sleep 8h. Pulse 80 bpm. Glucose 110 mg/dL. Weight 72.1 kg.",
    metrics: [
      { label: "BP", value: "125/93" },
      { label: "Sleep", value: "8h" },
      { label: "Pulse", value: "80 bpm" },
      { label: "Glucose", value: "110" },
      { label: "Weight", value: "72.1 kg" },
    ],
  },
  {
    id: "vita-ava-5",
    patientId: DEMO_VITA_PATIENT_ID,
    kind: "lab",
    dateOffset: { daysAgo: 22, hour: 11, minute: 0 },
    title: "Laboratory report",
    summary: "Home-program labs reviewed in Vita. Lipid panel within range.",
    metrics: [
      { label: "LDL", value: "98" },
      { label: "HDL", value: "54" },
      { label: "A1c", value: "5.8%" },
    ],
  },
  {
    id: "vita-ava-6",
    patientId: DEMO_VITA_PATIENT_ID,
    kind: "check-in",
    dateOffset: { daysAgo: 27, hour: 8, minute: 5 },
    title: "Daily check-in",
    summary:
      "Feeling 4/5. BP 128/82. Sleep 7h. Pulse 74 bpm. Weight 72.4 kg.",
    metrics: [
      { label: "BP", value: "128/82" },
      { label: "Sleep", value: "7h" },
      { label: "Pulse", value: "74 bpm" },
      { label: "Weight", value: "72.4 kg" },
    ],
  },
  {
    id: "vita-ava-7",
    patientId: DEMO_VITA_PATIENT_ID,
    kind: "check-in",
    dateOffset: { daysAgo: 47, hour: 20, minute: 10 },
    title: "Daily check-in",
    summary:
      "Feeling 4/5. BP 125/93. Sleep 8h. Pulse 80 bpm. Glucose 110 mg/dL. Weight 72.1 kg. Breathing stable.",
    metrics: [
      { label: "BP", value: "125/93" },
      { label: "Sleep", value: "8h" },
      { label: "Pulse", value: "80 bpm" },
      { label: "Glucose", value: "110" },
      { label: "Weight", value: "72.1 kg" },
      { label: "Breathing", value: "Stable" },
    ],
  },
  {
    id: "vita-ava-8",
    patientId: DEMO_VITA_PATIENT_ID,
    kind: "onboarding",
    dateOffset: { daysAgo: 47, hour: 10, minute: 0 },
    title: "RPM onboarding",
    summary:
      "Connected home BP cuff and daily check-ins in Vita. Baseline captured for hypertension and asthma monitoring.",
    metrics: [
      { label: "Baseline BP", value: "128/78" },
      { label: "Devices", value: "Cuff + inhaler" },
    ],
  },
]

export function getVitaHealthHistory(
  patientId: string,
  now: Date = demoNow()
): VitaHistoryEvent[] {
  if (patientId !== DEMO_VITA_PATIENT_ID) return []

  return avaHistoryTemplates
    .map((event) => ({
      ...event,
      date: dateFromOffset(now, event.dateOffset),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function filterVitaHistoryByPeriod(
  events: VitaHistoryEvent[],
  period: VitaHistoryPeriod,
  now: Date = demoNow()
): VitaHistoryEvent[] {
  if (period === "all") return events
  const cutoff = now.getTime() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000
  return events.filter((event) => new Date(event.date).getTime() >= cutoff)
}

export function vitaHistoryRangeLabel(events: VitaHistoryEvent[]): string | null {
  if (events.length === 0) return null
  const times = events.map((event) => new Date(event.date).getTime())
  const start = new Date(Math.min(...times))
  const end = new Date(Math.max(...times))
  return `${formatUsDate(start)} – ${formatUsDate(end)}`
}

export function vitaHistoryKindLabel(kind: VitaHistoryKind): string {
  switch (kind) {
    case "check-in":
      return "Check-in"
    case "lab":
      return "Lab"
    case "onboarding":
      return "Onboarding"
  }
}
