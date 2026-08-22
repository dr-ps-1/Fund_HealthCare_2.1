import { cn } from "@/lib/utils"

export type VisitType = "in-person" | "telehealth" | "follow-up"

const OPTIONS: { value: VisitType; label: string }[] = [
  { value: "in-person", label: "In-person" },
  { value: "telehealth", label: "Telehealth" },
  { value: "follow-up", label: "Follow-up" },
]

export function VisitTypeField({
  id,
  value,
  onChange,
  className,
}: {
  id?: string
  value: VisitType
  onChange: (value: VisitType) => void
  className?: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as VisitType)}
      className={cn(
        "border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className
      )}
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function closeDialogSafely(close: () => void) {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  window.setTimeout(close, 0)
}
