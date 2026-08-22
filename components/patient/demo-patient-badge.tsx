import { Badge } from "@/components/ui/badge"
import {
  demoPatientTierLabel,
  getDemoPatientTier,
} from "@/lib/demo-patients"
import { cn } from "@/lib/utils"

export function DemoPatientBadge({
  patientId,
  className,
}: {
  patientId: string
  className?: string
}) {
  const tier = getDemoPatientTier(patientId)
  const label = demoPatientTierLabel(tier)
  if (!label) return null

  return (
    <Badge
      variant="outline"
      className={cn(
        "ml-2 align-middle text-[10px] font-medium uppercase tracking-wide",
        tier === "star" && "border-primary/50 text-primary",
        tier === "secondary" && "border-border text-muted-foreground",
        tier === "vita-linked" && "border-[#16A34A]/50 text-[#16A34A]",
        className
      )}
    >
      {label}
    </Badge>
  )
}
