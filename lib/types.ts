export type PatientStatus = "green" | "yellow" | "red"

export interface Patient {
  id: string
  name: string
  age: number
  photo: string
  condition: string
  diagnosis: string
  riskScore: number
  status: PatientStatus
  lastActivity: string
  lastUpdate: string
  adherenceScore: number
}

export interface Alert {
  id: string
  patientId: string
  patientName: string
  type: "vitals" | "behavior" | "ai"
  severity: "high" | "medium" | "low"
  headline: string
  cause: string
  metric?: string
  time: string
  status: "active" | "resolved"
}

export interface TimelineEvent {
  id: string
  patientId: string
  type: "symptom" | "device" | "ai" | "visit" | "note"
  date: string
  headline: string
  description: string
  fullText?: string
  attachments?: string[]
}

export interface Message {
  id: string
  patientId: string
  patientName: string
  patientPhoto: string
  content: string
  time: string
  isFromDoctor: boolean
}

export interface Notification {
  id: string
  type: "alert" | "message" | "system"
  title: string
  description: string
  time: string
  read: boolean
}

export interface AISummary {
  patientId: string
  title: string
  insights: string[]
  generatedAt: string
}

export interface AIRecommendation {
  id: string
  patientId: string
  text: string
  acknowledged: boolean
}

export interface DoctorProfile {
  id: string
  name: string
  specialization: string
  email: string
  phone: string
  photo: string
}
