/** B2B mock data — Employer (4.1), Insurance (3.1+3.4), Government (5.1). */

// ─── Employer (4.1 Workforce Health) ─────────────────────────────────────────

export const employerWorkforce = {
  companyName: "Apex Manufacturing Group",
  employeesCovered: 4_280,
  healthyPct: 62,
  atRiskPct: 27,
  highRiskPct: 11,
}

export const employerHealthIndexSeries = [
  { month: "Sep", index: 68 },
  { month: "Oct", index: 69 },
  { month: "Nov", index: 71 },
  { month: "Dec", index: 70 },
  { month: "Jan", index: 72 },
  { month: "Feb", index: 74 },
  { month: "Mar", index: 75 },
  { month: "Apr", index: 76 },
  { month: "May", index: 78 },
  { month: "Jun", index: 79 },
  { month: "Jul", index: 81 },
  { month: "Aug", index: 82 },
]

export const employerSpendForecast = {
  withoutProgram: 2_400_000,
  withProgram: 1_900_000,
  savings: 500_000,
  savingsPct: 21,
}

export type EmployerRiskGroup = {
  group: string
  headcount: number
  avgRiskScore: number
  topDrivers: string
  projectedCost: number
  status: "healthy" | "at-risk" | "high-risk"
}

export const employerRiskGroups: EmployerRiskGroup[] = [
  {
    group: "Plant Ops — Night Shift",
    headcount: 620,
    avgRiskScore: 74,
    topDrivers: "Hypertension, sleep debt, musculoskeletal",
    projectedCost: 680_000,
    status: "high-risk",
  },
  {
    group: "Warehouse & Logistics",
    headcount: 540,
    avgRiskScore: 61,
    topDrivers: "Obesity, injury recurrence, diabetes",
    projectedCost: 420_000,
    status: "at-risk",
  },
  {
    group: "Corporate HQ",
    headcount: 380,
    avgRiskScore: 38,
    topDrivers: "Stress, sedentary lifestyle",
    projectedCost: 210_000,
    status: "healthy",
  },
  {
    group: "Field Sales",
    headcount: 210,
    avgRiskScore: 55,
    topDrivers: "Travel fatigue, missed screenings",
    projectedCost: 185_000,
    status: "at-risk",
  },
  {
    group: "R&D / Engineering",
    headcount: 290,
    avgRiskScore: 42,
    topDrivers: "Mental health, eye strain",
    projectedCost: 145_000,
    status: "healthy",
  },
]

// ─── Insurance (3.1 Portfolio + 3.4 Program ROI) ─────────────────────────────

export type ForecastHorizon = 6 | 12 | 24

export type PortfolioScenario = {
  name: "Baseline" | "Optimistic" | "Pessimistic"
  color: string
  claimsPmpm: number
  lossRatio: number
  membersAtRisk: number
}

export const insurancePortfolioForecast: Record<
  ForecastHorizon,
  PortfolioScenario[]
> = {
  6: [
    {
      name: "Baseline",
      color: "#2563EB",
      claimsPmpm: 412,
      lossRatio: 0.86,
      membersAtRisk: 18_400,
    },
    {
      name: "Optimistic",
      color: "#16A34A",
      claimsPmpm: 378,
      lossRatio: 0.79,
      membersAtRisk: 14_200,
    },
    {
      name: "Pessimistic",
      color: "#DC2626",
      claimsPmpm: 455,
      lossRatio: 0.94,
      membersAtRisk: 23_100,
    },
  ],
  12: [
    {
      name: "Baseline",
      color: "#2563EB",
      claimsPmpm: 428,
      lossRatio: 0.88,
      membersAtRisk: 21_600,
    },
    {
      name: "Optimistic",
      color: "#16A34A",
      claimsPmpm: 365,
      lossRatio: 0.76,
      membersAtRisk: 12_800,
    },
    {
      name: "Pessimistic",
      color: "#DC2626",
      claimsPmpm: 498,
      lossRatio: 0.99,
      membersAtRisk: 29_400,
    },
  ],
  24: [
    {
      name: "Baseline",
      color: "#2563EB",
      claimsPmpm: 461,
      lossRatio: 0.91,
      membersAtRisk: 26_800,
    },
    {
      name: "Optimistic",
      color: "#16A34A",
      claimsPmpm: 342,
      lossRatio: 0.71,
      membersAtRisk: 10_500,
    },
    {
      name: "Pessimistic",
      color: "#DC2626",
      claimsPmpm: 562,
      lossRatio: 1.06,
      membersAtRisk: 38_200,
    },
  ],
}

/** Line series for portfolio claims PMPM over months (Baseline / Optimistic / Pessimistic). */
export const insuranceClaimsTrend = [
  { month: "M1", baseline: 398, optimistic: 398, pessimistic: 398 },
  { month: "M3", baseline: 405, optimistic: 392, pessimistic: 418 },
  { month: "M6", baseline: 412, optimistic: 378, pessimistic: 455 },
  { month: "M9", baseline: 420, optimistic: 371, pessimistic: 476 },
  { month: "M12", baseline: 428, optimistic: 365, pessimistic: 498 },
  { month: "M18", baseline: 445, optimistic: 352, pessimistic: 530 },
  { month: "M24", baseline: 461, optimistic: 342, pessimistic: 562 },
]

export const insuranceRiskSegments = [
  { name: "Low risk", value: 48, color: "#16A34A" },
  { name: "Moderate", value: 29, color: "#F59E0B" },
  { name: "High risk", value: 16, color: "#DC2626" },
  { name: "Emerging", value: 7, color: "#2563EB" },
]

export type EarlyDetectionClient = {
  rank: number
  client: string
  members: number
  casesDetected: number
  avoidedCost: number
  leadTimeDays: number
}

export const insuranceTopEarlyDetection: EarlyDetectionClient[] = [
  {
    rank: 1,
    client: "Sunshine Health Trust",
    members: 84_200,
    casesDetected: 312,
    avoidedCost: 4_850_000,
    leadTimeDays: 47,
  },
  {
    rank: 2,
    client: "Gulf Coast Employers Pool",
    members: 52_100,
    casesDetected: 198,
    avoidedCost: 3_120_000,
    leadTimeDays: 41,
  },
  {
    rank: 3,
    client: "Atlantic Municipal Plan",
    members: 38_600,
    casesDetected: 156,
    avoidedCost: 2_640_000,
    leadTimeDays: 39,
  },
  {
    rank: 4,
    client: "Evergreen Self-Funded",
    members: 21_400,
    casesDetected: 94,
    avoidedCost: 1_480_000,
    leadTimeDays: 52,
  },
  {
    rank: 5,
    client: "Horizon Retail Alliance",
    members: 17_800,
    casesDetected: 71,
    avoidedCost: 980_000,
    leadTimeDays: 36,
  },
]

export type ProgramRoiRow = {
  program: string
  enrolled: number
  cost: number
  savings: number
  roi: number
  status: "scaling" | "pilot" | "mature"
}

export const insuranceProgramRoi: ProgramRoiRow[] = [
  {
    program: "Cardiometabolic early detection",
    enrolled: 12_400,
    cost: 1_860_000,
    savings: 6_420_000,
    roi: 3.5,
    status: "mature",
  },
  {
    program: "Diabetes remote monitoring",
    enrolled: 8_900,
    cost: 1_120_000,
    savings: 3_640_000,
    roi: 3.2,
    status: "scaling",
  },
  {
    program: "Pre-COPD intervention",
    enrolled: 3_200,
    cost: 480_000,
    savings: 1_150_000,
    roi: 2.4,
    status: "pilot",
  },
  {
    program: "Medication adherence coaching",
    enrolled: 15_600,
    cost: 720_000,
    savings: 2_080_000,
    roi: 2.9,
    status: "scaling",
  },
]

// ─── Government (5.1 Public Health Prevention) ───────────────────────────────

export type RiskZone = {
  county: string
  zip: string
  population: number
  riskLevel: "low" | "moderate" | "high" | "critical"
  riskScore: number
  topCondition: string
  preventableEvents: number
}

export const governmentRiskZones: RiskZone[] = [
  {
    county: "Miami-Dade",
    zip: "33142",
    population: 48_200,
    riskLevel: "critical",
    riskScore: 88,
    topCondition: "Diabetes / CKD",
    preventableEvents: 214,
  },
  {
    county: "Miami-Dade",
    zip: "33127",
    population: 36_800,
    riskLevel: "high",
    riskScore: 79,
    topCondition: "Hypertension",
    preventableEvents: 168,
  },
  {
    county: "Broward",
    zip: "33311",
    population: 41_500,
    riskLevel: "high",
    riskScore: 76,
    topCondition: "Asthma / COPD",
    preventableEvents: 142,
  },
  {
    county: "Palm Beach",
    zip: "33407",
    population: 29_400,
    riskLevel: "moderate",
    riskScore: 61,
    topCondition: "Cardiovascular",
    preventableEvents: 97,
  },
  {
    county: "Hillsborough",
    zip: "33610",
    population: 52_100,
    riskLevel: "high",
    riskScore: 74,
    topCondition: "Obesity / metabolic",
    preventableEvents: 189,
  },
  {
    county: "Orange",
    zip: "32805",
    population: 33_600,
    riskLevel: "moderate",
    riskScore: 58,
    topCondition: "Behavioral health",
    preventableEvents: 81,
  },
  {
    county: "Duval",
    zip: "32209",
    population: 27_900,
    riskLevel: "critical",
    riskScore: 85,
    topCondition: "Diabetes",
    preventableEvents: 156,
  },
  {
    county: "Pinellas",
    zip: "33705",
    population: 24_200,
    riskLevel: "moderate",
    riskScore: 55,
    topCondition: "Heart failure",
    preventableEvents: 72,
  },
]

/** ZIP cells for a simple CSS grid “heatmap” (South Florida focus). */
export type ZipHeatCell = {
  zip: string
  label: string
  riskScore: number
  riskLevel: RiskZone["riskLevel"]
}

export const governmentZipHeatmap: ZipHeatCell[] = [
  { zip: "33142", label: "Allapattah", riskScore: 88, riskLevel: "critical" },
  { zip: "33127", label: "Wynwood", riskScore: 79, riskLevel: "high" },
  { zip: "33136", label: "Overtown", riskScore: 82, riskLevel: "critical" },
  { zip: "33147", label: "Liberty City", riskScore: 84, riskLevel: "critical" },
  { zip: "33150", label: "Little Haiti", riskScore: 71, riskLevel: "high" },
  { zip: "33311", label: "Ft Lauderdale", riskScore: 76, riskLevel: "high" },
  { zip: "33313", label: "Lauderhill", riskScore: 68, riskLevel: "moderate" },
  { zip: "33407", label: "WPB North", riskScore: 61, riskLevel: "moderate" },
  { zip: "33401", label: "WPB Central", riskScore: 54, riskLevel: "moderate" },
  { zip: "33012", label: "Hialeah", riskScore: 72, riskLevel: "high" },
  { zip: "33023", label: "Miramar", riskScore: 49, riskLevel: "low" },
  { zip: "33157", label: "Palmetto Bay", riskScore: 38, riskLevel: "low" },
]

export type BudgetServiceRow = {
  service: string
  fyCurrent: number
  fyForecast: number
  deltaPct: number
  priority: "expand" | "maintain" | "optimize"
}

export const governmentBudgetForecast: BudgetServiceRow[] = [
  {
    service: "Preventive screenings",
    fyCurrent: 12_400_000,
    fyForecast: 15_800_000,
    deltaPct: 27,
    priority: "expand",
  },
  {
    service: "Chronic disease management",
    fyCurrent: 28_600_000,
    fyForecast: 31_200_000,
    deltaPct: 9,
    priority: "maintain",
  },
  {
    service: "Community health workers",
    fyCurrent: 6_200_000,
    fyForecast: 8_900_000,
    deltaPct: 44,
    priority: "expand",
  },
  {
    service: "Emergency / acute care",
    fyCurrent: 54_100_000,
    fyForecast: 48_700_000,
    deltaPct: -10,
    priority: "optimize",
  },
  {
    service: "Behavioral health outreach",
    fyCurrent: 9_800_000,
    fyForecast: 12_100_000,
    deltaPct: 23,
    priority: "expand",
  },
  {
    service: "Vaccination & maternal health",
    fyCurrent: 7_500_000,
    fyForecast: 7_800_000,
    deltaPct: 4,
    priority: "maintain",
  },
]

export function formatUsd(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`
    }
    if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`
    }
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPct(value: number): string {
  return `${value}%`
}
