import {
  dateFromOffset,
  daysAgoFrom,
  daysFromNowFrom,
  demoNow,
  formatUsDate,
  toDateOnlyIso,
  type DateOffset,
} from "@/lib/demo-clock"
import type {
  PatientHealthProfile,
  PatientVisit,
} from "@/lib/patient-health-profile"
import {
  patientHealthProfileTemplate,
  patientQuickReplies,
  SARAH_VISIT_GAP_DAYS,
} from "@/lib/patient-health-profile"
import type {
  AISummary,
  Patient,
  PreVisitBrief,
  TimelineEvent,
} from "@/lib/types"

export type PatientTemplate = Omit<Patient, "lastVisitDate" | "lastUpdate"> & {
  daysSinceVisit: number
}

type TimelineTemplate = Omit<TimelineEvent, "date"> & {
  dateOffset: DateOffset
}

type VisitTemplate = Omit<PatientVisit, "date"> & {
  daysAgo: number
}

export const patientTemplates: PatientTemplate[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    age: 71,
    photo: "/avatars/patient-1.jpg",
    condition: "Diabetes Type 2",
    diagnosis: "Type 2 Diabetes Mellitus with Essential Hypertension",
    riskScore: 88,
    status: "red",
    lastActivity: "2 hours ago",
    adherenceScore: 58,
    daysSinceVisit: SARAH_VISIT_GAP_DAYS,
    icdCodes: ["E11.9", "I10"],
    medications: [
      "Metformin 1000 mg BID",
      "Lisinopril 20 mg daily",
      "Atorvastatin 40 mg nightly",
    ],
    allergies: ["Penicillin"],
    keyMetric: "HbA1c 9.2%",
    city: "Miami",
    state: "FL",
    zip: "33101",
    dateOfBirth: "03/12/1955",
    insurancePayer: "Medicare",
    insurancePlan: "Medicare Advantage — Humana Gold Plus",
    memberId: "HUM-8X4K291",
    lastAwvDate: "06/15/2024",
  },
  {
    id: "2",
    name: "Maria Garcia",
    age: 54,
    photo: "/avatars/patient-2.jpg",
    condition: "Cardiovascular",
    diagnosis: "Chronic Heart Failure, NYHA Class II",
    riskScore: 71,
    status: "red",
    lastActivity: "4 hours ago",
    adherenceScore: 72,
    daysSinceVisit: 41,
    icdCodes: ["I50.22"],
    medications: [
      "Carvedilol 12.5 mg BID",
      "Furosemide 40 mg daily",
      "Spironolactone 25 mg",
    ],
    allergies: ["Sulfa drugs"],
    keyMetric: "BNP elevated",
    city: "Buffalo",
    state: "NY",
    zip: "14201",
  },
  {
    id: "3",
    name: "Robert Johnson",
    age: 72,
    photo: "/avatars/patient-3.jpg",
    condition: "COPD",
    diagnosis: "Chronic Obstructive Pulmonary Disease, Stage III",
    riskScore: 58,
    status: "yellow",
    lastActivity: "1 day ago",
    adherenceScore: 85,
    daysSinceVisit: 28,
    icdCodes: ["J44.1"],
    medications: ["Tiotropium inhaler", "Albuterol PRN"],
    allergies: [],
    keyMetric: "SpO2 90%",
    city: "Rochester",
    state: "NY",
    zip: "14604",
  },
  {
    id: "4",
    name: "Emily Chen",
    age: 45,
    photo: "/avatars/patient-4.jpg",
    condition: "Hypertension",
    diagnosis: "Essential Hypertension, Stage 2",
    riskScore: 45,
    status: "yellow",
    lastActivity: "6 hours ago",
    adherenceScore: 90,
    daysSinceVisit: 18,
    icdCodes: ["I10"],
    medications: ["Amlodipine 10 mg daily"],
    allergies: ["NKDA"],
    keyMetric: "BP 148/94",
    city: "Albany",
    state: "NY",
    zip: "12207",
  },
  {
    id: "5",
    name: "Michael Brown",
    age: 61,
    photo: "/avatars/patient-5.jpg",
    condition: "Diabetes Type 2",
    diagnosis: "Type 2 Diabetes with neuropathy",
    riskScore: 38,
    status: "green",
    lastActivity: "3 hours ago",
    adherenceScore: 95,
    daysSinceVisit: 12,
    icdCodes: ["E11.40"],
    medications: ["Metformin 500 mg BID", "Gabapentin 300 mg TID"],
    allergies: [],
    keyMetric: "HbA1c 6.8%",
    city: "Syracuse",
    state: "NY",
    zip: "13202",
  },
  {
    id: "6",
    name: "James Porter",
    age: 58,
    photo: "/avatars/patient-6.jpg",
    condition: "Cardiovascular",
    diagnosis: "Atrial Fibrillation, Stable",
    riskScore: 28,
    status: "green",
    lastActivity: "12 hours ago",
    adherenceScore: 98,
    daysSinceVisit: 9,
    icdCodes: ["I48.91"],
    medications: ["Apixaban 5 mg BID", "Metoprolol 50 mg BID"],
    allergies: ["Aspirin (intolerance)"],
    keyMetric: "INR N/A (DOAC)",
    city: "White Plains",
    state: "NY",
    zip: "10601",
  },
  {
    id: "7",
    name: "David Lee",
    age: 49,
    photo: "/avatars/patient-7.jpg",
    condition: "Hypertension",
    diagnosis: "Controlled Hypertension",
    riskScore: 22,
    status: "green",
    lastActivity: "1 day ago",
    adherenceScore: 92,
    daysSinceVisit: 21,
    icdCodes: ["I10"],
    medications: ["Losartan 50 mg daily"],
    allergies: [],
    keyMetric: "BP 128/78",
    city: "Ithaca",
    state: "NY",
    zip: "14850",
  },
  {
    id: "8",
    name: "Jennifer Martinez",
    age: 63,
    photo: "/avatars/patient-8.jpg",
    condition: "COPD",
    diagnosis: "COPD with acute exacerbation history",
    riskScore: 67,
    status: "yellow",
    lastActivity: "5 hours ago",
    adherenceScore: 78,
    daysSinceVisit: 35,
    icdCodes: ["J44.1"],
    medications: ["Budesonide/Formoterol", "Prednisone taper (recent)"],
    allergies: ["Latex"],
    keyMetric: "FEV1 48%",
    city: "Yonkers",
    state: "NY",
    zip: "10701",
  },
  {
    id: "9",
    name: "Ava Jackson",
    age: 63,
    photo: "/avatars/patient-2.jpg",
    condition: "Hypertension",
    diagnosis: "Essential Hypertension; Mild Persistent Asthma",
    riskScore: 52,
    status: "yellow",
    lastActivity: "2 hours ago",
    adherenceScore: 88,
    daysSinceVisit: 24,
    icdCodes: ["I10", "J45.30"],
    medications: [
      "Losartan 50 mg daily",
      "Amlodipine 5 mg daily",
      "Symbicort 160/4.5",
      "Albuterol HFA PRN",
    ],
    allergies: [],
    keyMetric: "BP 152/88",
    city: "Palo Alto",
    state: "CA",
    zip: "94301",
    dateOfBirth: "08/14/1962",
    insurancePayer: "Blue Cross Blue Shield",
    insurancePlan: "BCBS PPO — Silicon Valley Employer",
    memberId: "XYZ123456",
    lastAwvDate: "11/02/2025",
  },
]

const timelineTemplates: TimelineTemplate[] = [
  {
    id: "t1",
    patientId: "1",
    type: "device",
    dateOffset: { hoursAgo: 2 },
    headline: "Home Blood Pressure Reading",
    description: "BP: 168/102 mmHg — above threshold",
    fullText:
      "Automated reading from home BP monitor. Systolic elevated. Patient reported mild dizziness; no chest pain.",
  },
  {
    id: "t2",
    patientId: "1",
    type: "symptom",
    dateOffset: { hoursAgo: 3 },
    headline: "Patient Reported Fatigue",
    description: "Increased fatigue over 5 days",
    fullText:
      "Patient reported via portal: fatigue 6/10, polyuria evenings. No fever. Missed Metformin once this week.",
  },
  {
    id: "t3",
    patientId: "1",
    type: "ai",
    dateOffset: { hoursAgo: 4 },
    headline: "AI Risk Escalation",
    description: "HbA1c + visit gap flagged as Urgent",
    fullText: `Composite risk rose due to HbA1c 9.2%, ${SARAH_VISIT_GAP_DAYS} days without visit, and rising home BP. Recommend outreach and pre-visit labs.`,
  },
  {
    id: "t4",
    patientId: "1",
    type: "note",
    dateOffset: { daysAgo: SARAH_VISIT_GAP_DAYS, hour: 14, minute: 30 },
    headline: "Last Office Visit Note",
    description: "Discussed glycemic control and BP",
    fullText:
      "In-clinic BP 152/90. Weight 178 lbs. Reinforced Metformin adherence; ordered A1c/CMP. Follow-up planned in 6–8 weeks — patient overdue.",
  },
  {
    id: "t5",
    patientId: "1",
    type: "visit",
    dateOffset: { daysAgo: SARAH_VISIT_GAP_DAYS, hour: 10, minute: 0 },
    headline: "Office Visit — Internal Medicine",
    description: "Routine chronic care follow-up",
    fullText:
      "Problem list: T2DM, HTN. Labs drawn. Counseling on diet/sodium. Referral to diabetes education discussed; patient deferred.",
  },
  {
    id: "t6",
    patientId: "9",
    type: "device",
    dateOffset: { hoursAgo: 6 },
    headline: "Home BP synced from Vita AI",
    description: "BP 152/88 mmHg — above personal baseline",
    fullText:
      "Morning home cuff reading uploaded via Vita AI patient portal. Systolic above Ava's onboarding baseline for 5 consecutive days. Patient reports no chest pain.",
  },
  {
    id: "t7",
    patientId: "9",
    type: "symptom",
    dateOffset: { hoursAgo: 10 },
    headline: "Rescue inhaler logged",
    description: "Albuterol used — 2nd time in 10 days",
    fullText:
      "Patient logged rescue inhaler use in daily check-in. Symbicort adherence reported as consistent; nocturnal cough noted once this week.",
  },
  {
    id: "t8",
    patientId: "9",
    type: "ai",
    dateOffset: { hoursAgo: 8 },
    headline: "Cross-module monitoring alert",
    description: "BP trend + inhaler pattern flagged for clinician review",
    fullText:
      "iHealth composite signal: rising morning BP from connected devices plus increased rescue inhaler use. Recommend reviewing home logs and asthma action plan at next visit.",
  },
]

const visitTemplates: VisitTemplate[] = [
  {
    id: "v1",
    daysAgo: SARAH_VISIT_GAP_DAYS,
    specialist: "Dr. Sarah Wilson · Internal Medicine",
    diagnosis: "T2DM / HTN follow-up",
  },
  {
    id: "v2",
    daysAgo: 120,
    specialist: "Dr. Brian Schwartz · Endocrinology",
    diagnosis: "Diabetes therapy review",
  },
  {
    id: "v3",
    daysAgo: 180,
    specialist: "Lab · Quest Diagnostics",
    diagnosis: "HbA1c / CMP panel",
  },
  {
    id: "v4",
    daysAgo: 240,
    specialist: "Dr. Sarah Wilson · Internal Medicine",
    diagnosis: "Medication reconciliation",
  },
  {
    id: "v5",
    daysAgo: 300,
    specialist: "Ophthalmology · Bascom Palmer",
    diagnosis: "Diabetic eye screening",
  },
]

export function resolvePatient(
  template: PatientTemplate,
  now: Date = demoNow()
): Patient {
  const lastVisit = daysAgoFrom(now, template.daysSinceVisit)
  return {
    ...template,
    lastVisitDate: toDateOnlyIso(lastVisit),
    lastUpdate: dateFromOffset(now, { hoursAgo: 2 }),
  }
}

export function getDemoPatients(now: Date = demoNow()): Patient[] {
  return patientTemplates.map((p) => resolvePatient(p, now))
}

export function getTimelineEvents(now: Date = demoNow()): TimelineEvent[] {
  return timelineTemplates.map((event) => ({
    ...event,
    date: dateFromOffset(now, event.dateOffset),
  }))
}

export function getPatientHealthProfile(
  now: Date = demoNow()
): PatientHealthProfile {
  const visits: PatientVisit[] = visitTemplates.map((v) => ({
    id: v.id,
    specialist: v.specialist,
    diagnosis: v.diagnosis,
    date: toDateOnlyIso(daysAgoFrom(now, v.daysAgo)),
  }))

  const verificationVisit = daysFromNowFrom(now, 5)
  const verificationDateLabel = formatUsDate(verificationVisit)

  return {
    ...patientHealthProfileTemplate,
    visits,
    risks: patientHealthProfileTemplate.risks.map((risk) =>
      risk.id === "r3"
        ? {
            ...risk,
            title: `${SARAH_VISIT_GAP_DAYS} days since last clinic visit`,
          }
        : risk
    ),
    verification: patientHealthProfileTemplate.verification
      ? {
          ...patientHealthProfileTemplate.verification,
          visitDate: verificationDateLabel,
          headline: `Please confirm your visit on ${verificationDateLabel}`,
          questions:
            patientHealthProfileTemplate.verification.questions.map((q) =>
              q.id === "q1"
                ? {
                    ...q,
                    prompt: `Did you attend an in-person visit with Dr. Wilson on ${verificationDateLabel}?`,
                  }
                : q
            ),
        }
      : null,
  }
}

export function getAiSummaries(now: Date = demoNow()): Record<string, AISummary> {
  const generatedAt = dateFromOffset(now, { hoursAgo: 6 })
  return {
    "1": {
      patientId: "1",
      title: "Pre-visit snapshot",
      insights: [
        "HbA1c 9.2% — well above goal; last lab within past week",
        `${SARAH_VISIT_GAP_DAYS} days since last office visit (overdue chronic care)`,
        "Home BP trending up; morning reading 168/102 today",
        "Medication adherence ~58% (Metformin gaps reported)",
        "Allergy: Penicillin — avoid beta-lactams",
      ],
      generatedAt,
    },
    "2": {
      patientId: "2",
      title: "Weekly Summary",
      insights: [
        "Heart failure meds missed 3 days this week",
        "Fatigue levels reported as increasing",
        "Weight stable; monitor volume status at next visit",
      ],
      generatedAt,
    },
    "9": {
      patientId: "9",
      title: "RPM monitoring snapshot",
      insights: [
        "Home BP 152/88 — above personal baseline (connected device, synced 6h ago)",
        "Rescue inhaler used twice in 10 days; Symbicort daily reported",
        "Losartan adherence strong; Amlodipine recently added — monitor BP response",
        "Connected devices active — last sync within 6 hours",
      ],
      generatedAt,
    },
  }
}


export function getPreVisitBriefs(now: Date = demoNow()): Record<string, PreVisitBrief> {
  const sarah = resolvePatient(patientTemplates[0], now)
  const maria = resolvePatient(patientTemplates[1], now)
  const ava = resolvePatient(patientTemplates[8], now)

  return {
    "1": {
      patientId: "1",
      overview:
        "71-year-old woman with T2DM and hypertension presenting for overdue chronic-care follow-up. Highest panel risk today: glycemic control off-target with prolonged visit gap.",
      history: [
        "ICD-10: E11.9 (T2DM), I10 (Essential hypertension)",
        `Last office visit: ${formatUsDate(sarah.lastVisitDate)} (${sarah.daysSinceVisit} days ago) — Internal Medicine`,
        "Active meds: Metformin 1000 mg BID, Lisinopril 20 mg, Atorvastatin 40 mg",
        "Allergy: Penicillin",
        "Location: Miami, FL 33101",
      ],
      currentProblems: [
        "HbA1c 9.2% (goal <7%) — critical glycemic gap",
        "Home BP elevated (recent 168/102); adherence concerns",
        "Care gap: no ambulatory encounter in >60 days",
        "Fatigue and polyuria reported in last 5 days",
      ],
      recommendations: [
        "Confirm meds/allergies; reconcile OTC NSAID use",
        "Repeat labs: HbA1c, CMP, lipid panel; urine ACR",
        "Discuss therapy intensification and diabetes education referral",
        "Set close follow-up (2–4 weeks) and home BP log review",
        "Safety: avoid penicillin-class antibiotics",
      ],
    },
    "2": {
      patientId: "2",
      overview:
        "54-year-old with HFrEF (NYHA II). Red flag: multi-day HF medication gaps with rising fatigue.",
      history: [
        "ICD-10: I50.22",
        `Last visit: ${formatUsDate(maria.lastVisitDate)} (${maria.daysSinceVisit} days)`,
        "Meds: Carvedilol, Furosemide, Spironolactone",
        "Allergy: Sulfa",
      ],
      currentProblems: [
        "Missed HF medications × 3 days",
        "Increasing fatigue — assess volume/perfusion",
      ],
      recommendations: [
        "Same-day outreach; review weights and edema",
        "Reinstate GDMT; consider pharmacy sync",
        "Schedule HF follow-up within 1–2 weeks",
      ],
    },
    "9": {
      patientId: "9",
      overview:
        "63-year-old with hypertension and mild persistent asthma. Home BP above baseline; rescue inhaler use noted. Remote monitoring data available for today's visit.",
      history: [
        "ICD-10: I10, J45.30",
        "Meds: Losartan, Amlodipine, Symbicort, Albuterol PRN",
        `Last visit: ${formatUsDate(ava.lastVisitDate)} (${ava.daysSinceVisit} days)`,
        "RPM: connected home BP cuff + daily check-ins",
      ],
      currentProblems: [
        "Morning BP readings above onboarding baseline (152/88 home)",
        "Rescue inhaler used twice in 10 days",
        "New Amlodipine — confirm tolerance and adherence",
      ],
      recommendations: [
        "Review home BP technique and log",
        "Confirm controller inhaler adherence; asthma action plan",
        "Consider BP regimen adjustment if confirmed elevation",
      ],
    },
  }
}

export { patientQuickReplies }

export function buildDemoLabReportText(now: Date = demoNow()): string {
  const collectionDate = formatUsDate(daysAgoFrom(now, 2))
  return `
Patient: Sarah Johnson
DOB: 1955-03-12
Collection Date: ${collectionDate}
Ordering Physician: Dr. Sarah Wilson, Internal Medicine

CHEMISTRY / DIABETES PANEL
Glucose, fasting ........ 186 mg/dL (Ref 70-99) HIGH
Hemoglobin A1c .......... 9.1 % (Ref <5.7; diabetic goal <7.0) HIGH
Creatinine .............. 0.98 mg/dL
eGFR .................... 68 mL/min/1.73m2

VITALS (clinic)
Blood Pressure .......... 146/90 mmHg
Weight .................. 177 lbs
`.trim()
}
