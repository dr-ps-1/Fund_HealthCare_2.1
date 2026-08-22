import type { TimelineEvent } from "@/lib/types"
import { DEMO_VITA_PATIENT_ID } from "@/lib/demo-patients"
import {
  dateFromOffset,
  demoNow,
  formatUsDateTime,
  type DateOffset,
} from "@/lib/demo-clock"

export type VitaDeviceSource = "Withings" | "Dexcom"

export type VitaDeviceConnection = {
  name: VitaDeviceSource
  status: "connected"
}

export type VitaDeviceMeasurement = {
  id: string
  label: string
  value: string
  unit: string
  source: VitaDeviceSource
}

export type VitaDeviceSnapshot = {
  patientId: string
  connections: VitaDeviceConnection[]
  measurements: VitaDeviceMeasurement[]
  lastSyncedAt: string
  justSynced: boolean
}

const STORAGE_KEY = "vitaDeviceSyncByPatient"

const CONNECTIONS: VitaDeviceConnection[] = [
  { name: "Withings", status: "connected" },
  { name: "Dexcom", status: "connected" },
]

/** Latest Vita Devices & Sensors panel for Ava (Withings + Dexcom). */
const LATEST_MEASUREMENTS: VitaDeviceMeasurement[] = [
  { id: "pulse", label: "Pulse", value: "63", unit: "bpm", source: "Withings" },
  {
    id: "bp",
    label: "Blood pressure",
    value: "121/75",
    unit: "mmHg",
    source: "Withings",
  },
  {
    id: "steps",
    label: "Steps",
    value: "4,603",
    unit: "steps",
    source: "Withings",
  },
  {
    id: "sleep",
    label: "Sleep",
    value: "8.3",
    unit: "hours",
    source: "Withings",
  },
  {
    id: "weight",
    label: "Weight",
    value: "71.3",
    unit: "kg",
    source: "Withings",
  },
  {
    id: "glucose",
    label: "Blood glucose",
    value: "96",
    unit: "mg/dL",
    source: "Dexcom",
  },
]

const SEED_SYNC_OFFSET: DateOffset = { daysAgo: 1, hour: 18, minute: 0 }

function readFreshSyncAt(patientId: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const map = JSON.parse(raw) as Record<string, string>
    return map[patientId] ?? null
  } catch {
    return null
  }
}

function writeFreshSyncAt(patientId: string, iso: string) {
  if (typeof window === "undefined") return
  let map: Record<string, string> = {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) map = JSON.parse(raw) as Record<string, string>
  } catch {
    map = {}
  }
  map[patientId] = iso
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function getVitaDeviceSnapshot(
  patientId: string,
  now: Date = demoNow()
): VitaDeviceSnapshot | null {
  if (patientId !== DEMO_VITA_PATIENT_ID) return null

  const freshAt = readFreshSyncAt(patientId)
  const lastSyncedAt = freshAt ?? dateFromOffset(now, SEED_SYNC_OFFSET)

  return {
    patientId,
    connections: CONNECTIONS,
    measurements: LATEST_MEASUREMENTS,
    lastSyncedAt,
    justSynced: Boolean(freshAt),
  }
}

/** Demo beat: Ava tapped Sync now in Vita — doctor chart picks it up. */
export function pullLatestVitaDeviceSync(
  patientId: string,
  now: Date = new Date()
): VitaDeviceSnapshot | null {
  if (patientId !== DEMO_VITA_PATIENT_ID) return null
  const iso = now.toISOString()
  writeFreshSyncAt(patientId, iso)
  return {
    patientId,
    connections: CONNECTIONS,
    measurements: LATEST_MEASUREMENTS,
    lastSyncedAt: iso,
    justSynced: true,
  }
}

export function vitaDeviceSyncTimelineEvent(
  snapshot: VitaDeviceSnapshot
): TimelineEvent {
  const bp = snapshot.measurements.find((item) => item.id === "bp")
  const pulse = snapshot.measurements.find((item) => item.id === "pulse")
  const glucose = snapshot.measurements.find((item) => item.id === "glucose")

  return {
    id: snapshot.justSynced ? "vita-device-sync-live" : "vita-device-sync-seed",
    patientId: snapshot.patientId,
    type: "device",
    date: snapshot.lastSyncedAt,
    headline: snapshot.justSynced
      ? "Ava synced devices in Vita AI"
      : "Home devices — Withings + Dexcom",
    description: [
      bp ? `BP ${bp.value} ${bp.unit}` : null,
      pulse ? `Pulse ${pulse.value} ${pulse.unit}` : null,
      glucose ? `Glucose ${glucose.value} ${glucose.unit}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    fullText: snapshot.measurements
      .map(
        (item) =>
          `${item.label}: ${item.value} ${item.unit} · ${item.source} · From device`
      )
      .join("\n"),
  }
}

export function formatVitaDeviceSyncLabel(iso: string): string {
  return formatUsDateTime(iso)
}
