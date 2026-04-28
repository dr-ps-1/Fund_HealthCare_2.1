import { SearchX } from "lucide-react"
import type { Provider } from "@/lib/types"
import { calculateProviderRisk } from "@/lib/risk"
import { RiskIndicator } from "./risk-indicator"

interface ProviderResultsTableProps {
  providers: Provider[]
  total: number
}

export function ProviderResultsTable({ providers, total }: ProviderResultsTableProps) {
  return (
    <div>
      {/* Row count */}
      <p
        className="mb-3 text-xs font-medium tracking-wide uppercase"
        style={{ color: "var(--provider-slate)" }}
      >
        {total} provider{total !== 1 ? "s" : ""} found
      </p>

      <div
        className="overflow-x-auto rounded-lg border"
        style={{ borderColor: "var(--provider-slate-light)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left text-xs font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: "var(--provider-surface)",
                color: "var(--provider-slate)",
                borderBottom: "1px solid var(--provider-slate-light)",
              }}
            >
              <th className="px-4 py-3 font-semibold">NPI</th>
              <th className="px-4 py-3 font-semibold">Provider / Organization</th>
              <th className="px-4 py-3 font-semibold">Specialty</th>
              <th className="px-4 py-3 font-semibold">Region</th>
              <th className="px-4 py-3 font-semibold">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <SearchX
                      className="h-8 w-8"
                      style={{ color: "var(--provider-slate-light)" }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--provider-slate)" }}
                    >
                      No providers match your search criteria.
                    </p>
                    <p className="text-xs" style={{ color: "var(--provider-slate-light)" }}>
                      Try adjusting the search term or clearing filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              providers.map((provider, index) => {
                const risk = calculateProviderRisk(provider)
                const isHighRisk = risk === "high"

                return (
                  <tr
                    key={provider.npi}
                    style={{
                      backgroundColor: isHighRisk
                        ? "var(--provider-risk-high-bg)"
                        : index % 2 === 0
                        ? "#FFFFFF"
                        : "var(--provider-surface)",
                      borderBottom: "1px solid var(--provider-slate-light)",
                    }}
                  >
                    {/* NPI */}
                    <td
                      className="px-4 py-3 font-mono text-xs tracking-widest"
                      style={{ color: "var(--provider-navy-muted)" }}
                    >
                      {provider.npi}
                    </td>

                    {/* Provider / Organization */}
                    <td className="px-4 py-3">
                      <span
                        className="block font-semibold"
                        style={{ color: "var(--provider-navy)" }}
                      >
                        {provider.firstName} {provider.lastName}
                      </span>
                      <span
                        className="block text-xs mt-0.5"
                        style={{ color: "var(--provider-slate)" }}
                      >
                        {provider.organization}
                      </span>
                    </td>

                    {/* Specialty */}
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--provider-navy)" }}
                    >
                      {provider.specialty}
                    </td>

                    {/* Region */}
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: "var(--provider-slate)" }}
                    >
                      {provider.region}
                    </td>

                    {/* Risk Level */}
                    <td className="px-4 py-3">
                      <RiskIndicator risk={risk} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
