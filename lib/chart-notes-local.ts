const STORAGE_KEY = "clinicianChartNotesLocal"

type LocalChartNote = {
  id: string
  content: string
  created_at: string
}

function readAll(): Record<string, LocalChartNote[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, LocalChartNote[]>
  } catch {
    return {}
  }
}

function writeAll(notes: Record<string, LocalChartNote[]>) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function loadLocalChartNotes(
  patientId: string
): { id: string; content: string; created_at: string }[] {
  return readAll()[patientId] ?? []
}

export function saveLocalChartNote(
  patientId: string,
  content: string
): { id: string; content: string; created_at: string } {
  const all = readAll()
  const note: LocalChartNote = {
    id: `note-${Date.now()}`,
    content,
    created_at: new Date().toISOString(),
  }
  all[patientId] = [note, ...(all[patientId] ?? [])]
  writeAll(all)
  return note
}
