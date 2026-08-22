export type PatientStatus = "green" | "yellow" | "red"

/** US panel triage labels shown to clinicians (maps from PatientStatus). */
export type PanelStatusLabel = "OK" | "Attention" | "Urgent"

export interface Patient {
  id: string
  name: string
  age: number
  photo: string
  condition: string
  diagnosis: string
  /** Clinical risk 0–100 (higher = worse). Used for doctor triage. */
  riskScore: number
  status: PatientStatus
  lastActivity: string
  lastUpdate: string
  adherenceScore: number
  /** Days since last ambulatory encounter. */
  daysSinceVisit: number
  lastVisitDate: string
  icdCodes: string[]
  medications: string[]
  allergies: string[]
  /** Primary lab/vital callout for list views, e.g. "HbA1c 9.2%". */
  keyMetric: string
  city?: string
  state?: string
  zip?: string
  /** US display: MM/DD/YYYY */
  dateOfBirth?: string
  insurancePayer?: string
  insurancePlan?: string
  memberId?: string
  /** Annual wellness visit — US Medicare context */
  lastAwvDate?: string
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

export interface PreVisitBrief {
  patientId: string
  overview: string
  history: string[]
  currentProblems: string[]
  recommendations: string[]
}

export interface DoctorProfile {
  id: string
  name: string
  specialization: string
  /** NPI — US National Provider Identifier (display context for demo). */
  npi: string
  email: string
  phone: string
  photo: string
}

// ─── Provider Search ───────────────────────────────────────────────────────────

export type ProviderRisk = "low" | "medium" | "high"

export type Region =
  | "Western New York"
  | "Long Island"
  | "New York City"
  | "Hudson Valley"
  | "Capital Region"
  | "Central New York"
  | "North Country"
  | "Southern Tier"
  | "Finger Lakes"
  | "Mohawk Valley"

export type Specialty =
  | "Cardiology"
  | "Internal Medicine"
  | "Orthopedics"
  | "Neurology"
  | "Oncology"
  | "Pediatrics"
  | "Psychiatry"
  | "Radiology"
  | "General Surgery"
  | "Family Medicine"
  | "Endocrinology"
  | "Nephrology"
  | "Pulmonology"
  | "Gastroenterology"

export interface BillingCode {
  code: string
  description: string
  usageCount: number
}

export interface Provider {
  npi: string
  firstName: string
  lastName: string
  organization: string
  specialty: Specialty
  region: Region
  billingCodes: BillingCode[]
}
