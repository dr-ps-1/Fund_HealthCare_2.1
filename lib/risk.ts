import type { Provider, ProviderRisk } from "./types"
import { providers } from "./mock-data"

// Средний usageCount по всем кодам всех провайдеров — базовая линия для сравнения
function getBaselineAverage(): number {
  const allCounts = providers.flatMap((p) => p.billingCodes.map((c) => c.usageCount))
  return allCounts.reduce((sum, n) => sum + n, 0) / allCounts.length
}

let cachedBaseline: number | null = null

function baseline(): number {
  if (cachedBaseline === null) {
    cachedBaseline = getBaselineAverage()
  }
  return cachedBaseline
}

export function calculateProviderRisk(provider: Provider): ProviderRisk {
  if (provider.billingCodes.length === 0) return "low"

  const avg =
    provider.billingCodes.reduce((sum, c) => sum + c.usageCount, 0) /
    provider.billingCodes.length

  const ratio = avg / baseline()

  if (ratio > 2.5) return "high"
  if (ratio >= 1.5) return "medium"
  return "low"
}
