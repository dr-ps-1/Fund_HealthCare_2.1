import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ProviderSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ProviderSearchBar({ value, onChange }: ProviderSearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--provider-slate)" }}
      />
      <Input
        type="search"
        placeholder="Search by NPI, provider name or organization..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 h-10 text-sm"
        style={{
          borderColor: "var(--provider-slate-light)",
          color: "var(--provider-navy)",
        }}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" style={{ color: "var(--provider-slate)" }} />
        </Button>
      )}
    </div>
  )
}
