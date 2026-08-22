import { Activity, Droplets, Heart, Wind } from "lucide-react"
import type { Patient } from "@/lib/types"
import { formatUsDateNumeric } from "@/lib/demo-clock"
import { cn } from "@/lib/utils"

type VitalTile = {
  label: string
  value: string
  sub?: string
  icon: typeof Heart
  status?: "critical" | "elevated" | "normal"
}

function vitalsForPatient(patient: Patient): VitalTile[] {
  const tiles: VitalTile[] = []

  if (/diabetes/i.test(patient.condition)) {
    const a1cMatch = patient.keyMetric.match(/HbA1c\s+([\d.]+)/i)
    const a1c = a1cMatch?.[1] ?? "—"
    tiles.push({
      label: "HbA1c",
      value: `${a1c}%`,
      sub: "Last lab",
      icon: Droplets,
      status: Number(a1c) >= 9 ? "critical" : Number(a1c) >= 8 ? "elevated" : "normal",
    })
  }

  if (/hypertension|diabetes|heart/i.test(patient.condition + patient.diagnosis)) {
    const bpMatch = patient.keyMetric.match(/BP\s+([\d/]+)/i)
    tiles.push({
      label: "Blood pressure",
      value: bpMatch?.[1] ? `${bpMatch[1]} mmHg` : patient.keyMetric.includes("BP") ? patient.keyMetric : "See trend",
      sub: patient.id === "9" ? "Home monitoring" : "Clinic / home",
      icon: Heart,
      status: patient.status === "red" ? "critical" : patient.status === "yellow" ? "elevated" : "normal",
    })
  }

  if (/copd|asthma|respiratory/i.test(patient.condition + patient.diagnosis)) {
    tiles.push({
      label: "Respiratory",
      value: patient.keyMetric.includes("SpO2") ? patient.keyMetric : "Stable",
      sub: "Latest reading",
      icon: Wind,
      status: patient.status === "red" ? "critical" : "normal",
    })
  }

  tiles.push({
    label: "Adherence",
    value: `${patient.adherenceScore}%`,
    sub: "30-day estimate",
    icon: Activity,
    status:
      patient.adherenceScore < 70
        ? "critical"
        : patient.adherenceScore < 85
          ? "elevated"
          : "normal",
  })

  return tiles.slice(0, 4)
}

const statusClass = {
  critical: "border-destructive/40 bg-destructive/[0.04]",
  elevated: "border-[#F59E0B]/40 bg-[#F59E0B]/[0.04]",
  normal: "border-border bg-card",
}

export function PatientChartVitalsStrip({ patient }: { patient: Patient }) {
  const tiles = vitalsForPatient(patient)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <div
            key={tile.label}
            className={cn(
              "rounded-lg border px-4 py-3",
              tile.status ? statusClass[tile.status] : statusClass.normal
            )}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {tile.label}
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {tile.value}
            </p>
            {tile.sub && (
              <p className="text-xs text-muted-foreground">{tile.sub}</p>
            )}
          </div>
        )
      })}
      <p className="col-span-full text-xs text-muted-foreground">
        Last updated {formatUsDateNumeric(patient.lastVisitDate)} · not a substitute for full
        chart review
      </p>
    </div>
  )
}
