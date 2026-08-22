import type {
  Alert,
  Message,
  Notification,
  AIRecommendation,
  DoctorProfile,
  Provider,
} from "./types"
import { SARAH_VISIT_GAP_DAYS } from "./patient-health-profile"
import {
  DEMO_SECONDARY_PATIENT_ID,
  DEMO_STAR_PATIENT_ID,
} from "./demo-patients"
import {
  getDemoPatients,
  getTimelineEvents,
  getAiSummaries,
  getPreVisitBriefs,
} from "./resolve-demo-dates"

export {
  getDemoPatients,
  getTimelineEvents,
  getAiSummaries,
  getPreVisitBriefs,
}

/** High-signal red flags for the doctor home demo (top of triage). */
export function getRedFlagAlerts(): Alert[] {
  const sarah = getDemoPatients().find((p) => p.id === DEMO_SECONDARY_PATIENT_ID)
  const ava = getDemoPatients().find((p) => p.id === DEMO_STAR_PATIENT_ID)
  const lastVisitLabel = sarah?.lastVisitDate ?? "recently"
  return [
    {
      id: "rf0",
      patientId: DEMO_STAR_PATIENT_ID,
      patientName: ava?.name ?? "Ava Jackson",
      type: "vitals",
      severity: "medium",
      headline: "Ava Jackson — home BP above RPM baseline; review before visit.",
      cause:
        "Connected cuff: morning readings above onboarding baseline for several days. Rescue inhaler logged twice in 10 days.",
      metric: "BP 152/88 · RPM",
      time: "Just now",
      status: "active",
    },
    {
      id: "rf1",
      patientId: DEMO_SECONDARY_PATIENT_ID,
      patientName: "Sarah Johnson",
      type: "vitals",
      severity: "high",
      headline: `Sarah Johnson — HbA1c critically high. ${SARAH_VISIT_GAP_DAYS} days without a visit.`,
      cause: `Last HbA1c 9.2% (target <7%). No ambulatory encounter since ${lastVisitLabel}.`,
      metric: `HbA1c 9.2% · ${SARAH_VISIT_GAP_DAYS} days`,
      time: "Just now",
      status: "active",
    },
  {
    id: "rf2",
    patientId: "2",
    patientName: "Maria Garcia",
    type: "behavior",
    severity: "high",
    headline: "Maria Garcia — missed HF meds 3 days; rising fatigue.",
    cause: "Carvedilol/furosemide adherence gap with worsening fatigue reports.",
    metric: "3 missed days",
    time: "1 hour ago",
    status: "active",
  },
  {
    id: "rf3",
    patientId: "8",
    patientName: "Jennifer Martinez",
    type: "ai",
    severity: "medium",
    headline: "Jennifer Martinez — COPD risk rising; activity down, SpO2 soft.",
    cause: "AI pattern: reduced steps + borderline SpO2 after recent exacerbation.",
    metric: "SpO2 trend",
    time: "3 hours ago",
    status: "active",
  },
  ]
}

export const alerts: Alert[] = [
  ...getRedFlagAlerts(),
  {
    id: "a1",
    patientId: "1",
    patientName: "Sarah Johnson",
    type: "vitals",
    severity: "high",
    headline: "Home BP spike",
    cause: "Morning home reading above threshold",
    metric: "BP: 168/102 mmHg",
    time: "10 minutes ago",
    status: "active",
  },
  {
    id: "a4",
    patientId: "3",
    patientName: "Robert Johnson",
    type: "vitals",
    severity: "medium",
    headline: "Oxygen Saturation Low",
    cause: "SpO2 dropped below 92%",
    metric: "SpO2: 90%",
    time: "4 hours ago",
    status: "active",
  },
]

export const messages: Message[] = [
  {
    id: "m1",
    patientId: "1",
    patientName: "Sarah Johnson",
    patientPhoto: "/avatars/patient-1.jpg",
    content:
      "Dr. Wilson, my home BP was high this morning and I feel more tired. Should I come in?",
    time: "10:35 AM",
    isFromDoctor: false,
  },
  {
    id: "m2",
    patientId: "1",
    patientName: "Sarah Johnson",
    patientPhoto: "/avatars/patient-1.jpg",
    content:
      "Thank you for reporting this, Sarah. Please rest, take medications as prescribed, and we will review your chart and reach out today.",
    time: "10:42 AM",
    isFromDoctor: true,
  },
  {
    id: "m3",
    patientId: "2",
    patientName: "Maria Garcia",
    patientPhoto: "/avatars/patient-2.jpg",
    content: "Hello, I have been feeling more fatigued than usual lately.",
    time: "9:15 AM",
    isFromDoctor: false,
  },
  {
    id: "m4",
    patientId: "4",
    patientName: "Emily Chen",
    patientPhoto: "/avatars/patient-4.jpg",
    content: "Thank you for the prescription renewal, Doctor.",
    time: "Yesterday",
    isFromDoctor: false,
  },
  {
    id: "m5",
    patientId: "9",
    patientName: "Ava Jackson",
    patientPhoto: "/avatars/patient-2.jpg",
    content:
      "Good morning Dr. Wilson — home BP averaged 152/88 this week. Anything I should change before our visit?",
    time: "8:20 AM",
    isFromDoctor: false,
  },
  {
    id: "m6",
    patientId: "9",
    patientName: "Ava Jackson",
    patientPhoto: "/avatars/patient-2.jpg",
    content:
      "Thanks Ava — continue current meds, log morning readings, and we will review RPM data at your appointment.",
    time: "8:35 AM",
    isFromDoctor: true,
  },
]

export const notifications: Notification[] = [
    {
      id: "n1",
      type: "alert",
      title: "RPM panel flag",
      description: "Ava Jackson: home BP 152/88 · connected device sync",
      time: "Just now",
      read: false,
    },
    {
      id: "n1b",
      type: "alert",
      title: "Urgent panel flag",
      description: `Sarah Johnson: HbA1c critical · ${SARAH_VISIT_GAP_DAYS} days without visit`,
    time: "Just now",
    read: false,
  },
  {
    id: "n2",
    type: "message",
    title: "New Message",
    description: "Maria Garcia sent you a message",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    type: "system",
    title: "Weekly Report Ready",
    description: "Your patient panel analytics report is ready",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "n4",
    type: "alert",
    title: "Medium Priority Alert",
    description: "Robert Johnson: SpO2 below threshold",
    time: "4 hours ago",
    read: true,
  },
]

export const aiRecommendations: AIRecommendation[] = [
  {
    id: "r1",
    patientId: "1",
    text: "Order repeat HbA1c/CMP and consider intensifying glycemic therapy",
    acknowledged: false,
  },
  {
    id: "r2",
    patientId: "1",
    text: `Schedule urgent chronic-care visit given ${SARAH_VISIT_GAP_DAYS}-day gap and rising BP`,
    acknowledged: false,
  },
  {
    id: "r3",
    patientId: "2",
    text: "Outreach for HF medication adherence and volume assessment",
    acknowledged: false,
  },
]

export const doctorProfile: DoctorProfile = {
  id: "d1",
  name: "Dr. Sarah Wilson",
  specialization: "Internal Medicine",
  npi: "1679584731",
  email: "sarah.wilson@clinic.com",
  phone: "+1 (555) 123-4567",
  photo: "/avatars/doctor.jpg",
}

// ─── Provider Search ───────────────────────────────────────────────────────────

export const providers: Provider[] = [
  {
    npi: "1234567890",
    firstName: "James",
    lastName: "Hartwell",
    organization: "Buffalo General Medical Center",
    specialty: "Cardiology",
    region: "Western New York",
    billingCodes: [
      { code: "99213", description: "Office visit, low complexity", usageCount: 820 },
      { code: "93000", description: "Electrocardiogram", usageCount: 640 },
      { code: "99214", description: "Office visit, moderate complexity", usageCount: 310 },
    ],
  },
  {
    npi: "2345678901",
    firstName: "Patricia",
    lastName: "Nguyen",
    organization: "Long Island Jewish Medical Center",
    specialty: "Internal Medicine",
    region: "Long Island",
    billingCodes: [
      { code: "99213", description: "Office visit, low complexity", usageCount: 1240 },
      { code: "99232", description: "Subsequent hospital care", usageCount: 980 },
      { code: "99215", description: "Office visit, high complexity", usageCount: 560 },
    ],
  },
  {
    npi: "3456789012",
    firstName: "Robert",
    lastName: "Chen",
    organization: "NYU Langone Health",
    specialty: "Orthopedics",
    region: "New York City",
    billingCodes: [
      { code: "27447", description: "Total knee arthroplasty", usageCount: 310 },
      { code: "29881", description: "Knee arthroscopy", usageCount: 275 },
      { code: "99213", description: "Office visit, low complexity", usageCount: 490 },
    ],
  },
  {
    npi: "4567890123",
    firstName: "Linda",
    lastName: "Morrison",
    organization: "Hudson Valley Neurology Associates",
    specialty: "Neurology",
    region: "Hudson Valley",
    billingCodes: [
      { code: "99214", description: "Office visit, moderate complexity", usageCount: 760 },
      { code: "95816", description: "EEG, awake and drowsy", usageCount: 430 },
      { code: "99213", description: "Office visit, low complexity", usageCount: 390 },
    ],
  },
  {
    npi: "5678901234",
    firstName: "David",
    lastName: "Okafor",
    organization: "Albany Medical Center",
    specialty: "Oncology",
    region: "Capital Region",
    billingCodes: [
      { code: "99215", description: "Office visit, high complexity", usageCount: 890 },
      { code: "96413", description: "Chemotherapy administration", usageCount: 1450 },
      { code: "99214", description: "Office visit, moderate complexity", usageCount: 620 },
    ],
  },
  {
    npi: "6789012345",
    firstName: "Susan",
    lastName: "Kowalski",
    organization: "Upstate Pediatric Associates",
    specialty: "Pediatrics",
    region: "Central New York",
    billingCodes: [
      { code: "99213", description: "Office visit, low complexity", usageCount: 1100 },
      { code: "99391", description: "Preventive care, infant", usageCount: 870 },
      { code: "99392", description: "Preventive care, early childhood", usageCount: 640 },
    ],
  },
  {
    npi: "7890123456",
    firstName: "Michael",
    lastName: "Torres",
    organization: "North Country Behavioral Health",
    specialty: "Psychiatry",
    region: "North Country",
    billingCodes: [
      { code: "90837", description: "Psychotherapy, 60 min", usageCount: 2100 },
      { code: "90834", description: "Psychotherapy, 45 min", usageCount: 1850 },
      { code: "99213", description: "Office visit, low complexity", usageCount: 430 },
    ],
  },
  {
    npi: "8901234567",
    firstName: "Angela",
    lastName: "Reyes",
    organization: "Southern Tier Radiology Group",
    specialty: "Radiology",
    region: "Southern Tier",
    billingCodes: [
      { code: "71046", description: "Chest X-ray, 2 views", usageCount: 3200 },
      { code: "74177", description: "CT abdomen and pelvis", usageCount: 2800 },
      { code: "70553", description: "MRI brain with contrast", usageCount: 1750 },
    ],
  },
  {
    npi: "9012345678",
    firstName: "Thomas",
    lastName: "Blackwell",
    organization: "Finger Lakes Surgical Associates",
    specialty: "General Surgery",
    region: "Finger Lakes",
    billingCodes: [
      { code: "43239", description: "Esophagogastroduodenoscopy", usageCount: 480 },
      { code: "44950", description: "Appendectomy", usageCount: 145 },
      { code: "99213", description: "Office visit, low complexity", usageCount: 310 },
    ],
  },
  {
    npi: "0123456789",
    firstName: "Karen",
    lastName: "Patel",
    organization: "Mohawk Valley Family Health Center",
    specialty: "Family Medicine",
    region: "Mohawk Valley",
    billingCodes: [
      { code: "99213", description: "Office visit, low complexity", usageCount: 1680 },
      { code: "99214", description: "Office visit, moderate complexity", usageCount: 920 },
      { code: "99395", description: "Preventive care, 18–39 years", usageCount: 540 },
    ],
  },
  {
    npi: "1357924680",
    firstName: "Brian",
    lastName: "Schwartz",
    organization: "Brooklyn Endocrinology Center",
    specialty: "Endocrinology",
    region: "New York City",
    billingCodes: [
      { code: "99214", description: "Office visit, moderate complexity", usageCount: 1920 },
      { code: "83036", description: "Hemoglobin A1c", usageCount: 3400 },
      { code: "99213", description: "Office visit, low complexity", usageCount: 1100 },
    ],
  },
  {
    npi: "2468013579",
    firstName: "Donna",
    lastName: "Fitzgerald",
    organization: "Nassau County Nephrology Group",
    specialty: "Nephrology",
    region: "Long Island",
    billingCodes: [
      { code: "90960", description: "End-stage renal disease, per month", usageCount: 4100 },
      { code: "99213", description: "Office visit, low complexity", usageCount: 870 },
      { code: "99214", description: "Office visit, moderate complexity", usageCount: 640 },
    ],
  },
  {
    npi: "1122334455",
    firstName: "Gregory",
    lastName: "Walsh",
    organization: "Erie County Pulmonary Medicine",
    specialty: "Pulmonology",
    region: "Western New York",
    billingCodes: [
      { code: "94010", description: "Spirometry", usageCount: 1560 },
      { code: "99214", description: "Office visit, moderate complexity", usageCount: 980 },
      { code: "94640", description: "Inhalation treatment", usageCount: 2200 },
    ],
  },
  {
    npi: "5544332211",
    firstName: "Olivia",
    lastName: "Marchetti",
    organization: "Capital Region Gastroenterology",
    specialty: "Gastroenterology",
    region: "Capital Region",
    billingCodes: [
      { code: "45378", description: "Colonoscopy, diagnostic", usageCount: 2650 },
      { code: "43239", description: "Esophagogastroduodenoscopy", usageCount: 1980 },
      { code: "99213", description: "Office visit, low complexity", usageCount: 720 },
    ],
  },
  {
    npi: "9988776655",
    firstName: "Kevin",
    lastName: "Drummond",
    organization: "Plattsburgh Internal Medicine Associates",
    specialty: "Internal Medicine",
    region: "North Country",
    billingCodes: [
      { code: "99213", description: "Office visit, low complexity", usageCount: 530 },
      { code: "99214", description: "Office visit, moderate complexity", usageCount: 310 },
      { code: "99215", description: "Office visit, high complexity", usageCount: 180 },
    ],
  },
]

export const providerRegions: string[] = [
  "Western New York",
  "Long Island",
  "New York City",
  "Hudson Valley",
  "Capital Region",
  "Central New York",
  "North Country",
  "Southern Tier",
  "Finger Lakes",
  "Mohawk Valley",
]

export const providerSpecialties: string[] = [
  "Cardiology",
  "Internal Medicine",
  "Orthopedics",
  "Neurology",
  "Oncology",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "General Surgery",
  "Family Medicine",
  "Endocrinology",
  "Nephrology",
  "Pulmonology",
  "Gastroenterology",
]
