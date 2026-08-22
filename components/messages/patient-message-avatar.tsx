import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type PatientMessageAvatarProps = {
  name: string
  photo: string
  className?: string
}

function initialsForName(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function PatientMessageAvatar({
  name,
  photo,
  className,
}: PatientMessageAvatarProps) {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarImage src={photo} alt={name} />
      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
        {initialsForName(name)}
      </AvatarFallback>
    </Avatar>
  )
}
