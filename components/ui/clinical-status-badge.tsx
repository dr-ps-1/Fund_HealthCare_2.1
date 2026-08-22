import type { PatientStatus } from "@/lib/types"
import { panelStatusLabel } from "@/lib/patient-status"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ClinicalStatusBadge({
  status,
  className,
}: {
  status: PatientStatus
  className?: string
}) {
  return (
    <Badge
      className={cn(
        "font-medium",
        status === "green" &&
          "border-transparent bg-success/15 text-success hover:bg-success/15",
        status === "yellow" &&
          "border-transparent bg-warning/15 text-warning hover:bg-warning/15",
        status === "red" &&
          "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/15",
        className
      )}
    >
      {panelStatusLabel(status)}
    </Badge>
  )
}
