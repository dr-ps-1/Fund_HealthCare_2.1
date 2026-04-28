import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { providerRegions, providerSpecialties } from "@/lib/mock-data"

interface ProviderFiltersProps {
  region: string
  specialty: string
  onRegionChange: (value: string) => void
  onSpecialtyChange: (value: string) => void
  onClear: () => void
}

export function ProviderFilters({
  region,
  specialty,
  onRegionChange,
  onSpecialtyChange,
  onClear,
}: ProviderFiltersProps) {
  const hasActiveFilter = region !== "all" || specialty !== "all"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={region} onValueChange={onRegionChange}>
        <SelectTrigger
          className="w-[200px] h-9 text-sm"
          style={{
            borderColor: "var(--provider-slate-light)",
            color: region !== "all" ? "var(--provider-navy)" : "var(--provider-slate)",
          }}
        >
          <SelectValue placeholder="All Regions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {providerRegions.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={specialty} onValueChange={onSpecialtyChange}>
        <SelectTrigger
          className="w-[200px] h-9 text-sm"
          style={{
            borderColor: "var(--provider-slate-light)",
            color: specialty !== "all" ? "var(--provider-navy)" : "var(--provider-slate)",
          }}
        >
          <SelectValue placeholder="All Specialties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Specialties</SelectItem>
          {providerSpecialties.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-9 gap-1.5 text-sm"
          style={{ color: "var(--provider-slate)" }}
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
