import type { ProviderRisk } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RiskIndicatorProps {
  risk: ProviderRisk
}

const config: Record<ProviderRisk, { label: string; dot: string; badge: string; tooltip: string }> = {
  low: {
    label: "Low Risk",
    dot: "bg-[var(--provider-risk-low)]",
    badge: "text-[var(--provider-risk-low)] bg-[var(--provider-risk-low-bg)]",
    tooltip: "Billing code usage is within the expected range for this specialty.",
  },
  medium: {
    label: "Medium Risk",
    dot: "bg-[var(--provider-risk-medium)]",
    badge: "text-[var(--provider-risk-medium)] bg-[var(--provider-risk-medium-bg)]",
    tooltip: "Billing code usage is 1.5–2.5× above the network average. Review recommended.",
  },
  high: {
    label: "High Risk",
    dot: "bg-[var(--provider-risk-high)]",
    badge: "text-[var(--provider-risk-high)] bg-[var(--provider-risk-high-bg)]",
    tooltip: "Billing code usage exceeds 2.5× the network average. Audit advised.",
  },
}

export function RiskIndicator({ risk }: RiskIndicatorProps) {
  const { label, dot, badge, tooltip } = config[risk]

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-default select-none ${badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`} />
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[220px] text-center text-xs"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
