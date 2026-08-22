const MAX_PHOTO_BYTES = 2 * 1024 * 1024

const ACCEPTED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

export function validateProfilePhotoFile(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.has(file.type)) {
    return "Use a JPG, PNG, or WebP image."
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return "Image must be 2 MB or smaller."
  }
  return null
}

export function readProfilePhotoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }
      reject(new Error("Failed to read image"))
    }
    reader.onerror = () => reject(new Error("Failed to read image"))
    reader.readAsDataURL(file)
  })
}
