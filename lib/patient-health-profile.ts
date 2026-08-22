export interface PatientMetric {
  id: string
  label: string
  value: string
  unit?: string
  normalRange: string
  trend: "up" | "down" | "stable"
  trendLabel: string
  status: "normal" | "watch" | "high"
}

export interface PatientRiskItem {
  id: string
  level: "High" | "Medium" | "Low"
  title: string
  recommendation: string
}

export interface PatientVisit {
  id: string
  date: string
  specialist: string
  diagnosis: string
}

export interface VerificationQuestion {
  id: string
  prompt: string
}

export interface VerificationRequest {
  id: string
  source: string
  visitDate: string
  providerName: string
  headline: string
  questions: VerificationQuestion[]
}

export interface PatientHealthProfile {
  id: string
  name: string
  age: number
  city: string
  state: string
  zip: string
  healthScore: number
  healthScoreTrend: "up" | "down" | "stable"
  healthScoreExplanation: string
  diagnoses: string[]
  metrics: PatientMetric[]
  risks: PatientRiskItem[]
  visits: PatientVisit[]
  verification: VerificationRequest | null
}

/** Care-gap anchor for Sarah Johnson demo story (days since last visit). */
export const SARAH_VISIT_GAP_DAYS = 67

/**
 * Static patient profile fields. Dates resolved at runtime via getPatientHealthProfile().
 */
export const patientHealthProfileTemplate: Omit<
  PatientHealthProfile,
  "visits" | "verification"
> & {
  verification: Omit<VerificationRequest, "visitDate" | "headline"> & {
    visitDate?: string
    headline?: string
  }
} = {
  id: "1",
  name: "Sarah Johnson",
  age: 71,
  city: "Miami",
  state: "FL",
  zip: "33101",
  healthScore: 68,
  healthScoreTrend: "down",
  healthScoreExplanation:
    "Your score is in the caution range mainly because HbA1c has stayed above goal for 3 months and blood pressure readings are trending up.",
  diagnoses: ["Type 2 Diabetes Mellitus", "Essential Hypertension"],
  metrics: [
    {
      id: "hba1c",
      label: "HbA1c",
      value: "9.2",
      unit: "%",
      normalRange: "< 7.0%",
      trend: "up",
      trendLabel: "Rising 3 months",
      status: "high",
    },
    {
      id: "bp",
      label: "Blood pressure",
      value: "148/92",
      unit: "mmHg",
      normalRange: "< 130/80",
      trend: "up",
      trendLabel: "Above target",
      status: "high",
    },
    {
      id: "weight",
      label: "Weight",
      value: "178",
      unit: "lbs",
      normalRange: "Goal 170",
      trend: "up",
      trendLabel: "+3 lbs / 8 wks",
      status: "watch",
    },
    {
      id: "steps",
      label: "Activity",
      value: "3,200",
      unit: "steps",
      normalRange: "≥ 6,000",
      trend: "down",
      trendLabel: "Below usual",
      status: "watch",
    },
    {
      id: "sleep",
      label: "Sleep",
      value: "5.4",
      unit: "hrs",
      normalRange: "7–8 hrs",
      trend: "down",
      trendLabel: "Fragmented",
      status: "watch",
    },
  ],
  risks: [
    {
      id: "r1",
      level: "High",
      title: "HbA1c above goal for 3 months",
      recommendation: "Schedule endocrinology / PCP visit to review therapy.",
    },
    {
      id: "r2",
      level: "High",
      title: "Home BP elevated",
      recommendation:
        "Log morning readings for 7 days; avoid missed Lisinopril doses.",
    },
    {
      id: "r3",
      level: "Medium",
      title: `${SARAH_VISIT_GAP_DAYS} days since last clinic visit`,
      recommendation: "Book chronic-care follow-up this week.",
    },
  ],
  verification: {
    id: "vr-1",
    source: "FraudShield (S2)",
    providerName: "Dr. Wilson",
    questions: [
      {
        id: "q1",
        prompt: "Did you attend an in-person visit with Dr. Wilson?",
      },
      {
        id: "q2",
        prompt: "Was the visit related to diabetes or blood pressure?",
      },
      {
        id: "q3",
        prompt: "Did you receive any new prescriptions that day?",
      },
      {
        id: "q4",
        prompt: "About how long did the visit last?",
      },
      {
        id: "q5",
        prompt: "Would you recognize the clinic location if shown on a map?",
      },
    ],
  },
}

export const patientQuickReplies = [
  "Why is my risk high?",
  "What does my HbA1c mean?",
  "When is my next visit?",
  "How can I improve my Health Score?",
  "Should I worry about my blood pressure?",
]
