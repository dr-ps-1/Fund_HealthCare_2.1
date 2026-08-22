"use client"

import { useRef, useState } from "react"
import { Camera, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  readProfilePhotoFile,
  validateProfilePhotoFile,
} from "@/lib/clinician-photo"
import { cn } from "@/lib/utils"

type ClinicianPhotoEditorProps = {
  name: string
  photo: string
  disabled?: boolean
  showAvatar?: boolean
  onPhotoChange: (photo: string) => void
  className?: string
}

function clinicianInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ClinicianPhotoEditor({
  name,
  photo,
  disabled = false,
  showAvatar = true,
  onPhotoChange,
  className,
}: ClinicianPhotoEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const validationError = validateProfilePhotoFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const dataUrl = await readProfilePhotoFile(file)
      onPhotoChange(dataUrl)
    } catch {
      setError("Could not load this image. Try another file.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {showAvatar && (
        <Avatar className="h-32 w-32">
          <AvatarImage src={photo || undefined} alt={name} />
          <AvatarFallback className="bg-brand-navy text-2xl font-semibold text-brand-navy-foreground">
            {clinicianInitials(name)}
          </AvatarFallback>
        </Avatar>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled || loading}
        onChange={(event) => void handleFileSelect(event)}
      />

      <div className={cn("flex flex-wrap justify-center gap-2", showAvatar && "mt-4")}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || loading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-1.5 h-3.5 w-3.5" />
          {loading ? "Uploading…" : photo ? "Change photo" : "Add photo"}
        </Button>
        {photo && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || loading}
            onClick={() => {
              setError(null)
              onPhotoChange("")
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-2 max-w-xs text-center text-xs text-destructive">{error}</p>
      )}
      <p className="mt-2 max-w-xs text-center text-xs text-muted-foreground">
        JPG, PNG, or WebP · max 2 MB
      </p>
    </div>
  )
}

export function ClinicianAvatar({
  name,
  photo,
  className,
}: {
  name: string
  photo: string
  className?: string
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={photo || undefined} alt={name} />
      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
        {clinicianInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
