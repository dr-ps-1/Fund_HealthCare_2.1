"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { ProviderSearchBar } from "@/components/providers/provider-search-bar"
import { ProviderFilters } from "@/components/providers/provider-filters"
import { ProviderResultsTable } from "@/components/providers/provider-results-table"
import { providers } from "@/lib/mock-data"

export default function ProviderSearchPage() {
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("all")
  const [specialty, setSpecialty] = useState("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return providers.filter((p) => {
      // Поиск: 10 цифр → NPI, иначе по имени и организации
      const matchesQuery =
        q === "" ||
        (/^\d{10}$/.test(q)
          ? p.npi === q
          : `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
            p.organization.toLowerCase().includes(q))

      const matchesRegion = region === "all" || p.region === region
      const matchesSpecialty = specialty === "all" || p.specialty === specialty

      return matchesQuery && matchesRegion && matchesSpecialty
    })
  }, [query, region, specialty])

  function handleClearFilters() {
    setRegion("all")
    setSpecialty("all")
  }

  return (
    <AppShell>
      <div
        className="flex flex-col gap-6"
        style={{ color: "var(--provider-navy)" }}
      >
        {/* Header */}
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--provider-navy)" }}
          >
            Provider Search
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--provider-slate)" }}
          >
            Search and filter healthcare providers across New York State
          </p>
        </div>

        {/* Search + Filters */}
        <div
          className="rounded-xl border p-5 flex flex-col gap-4"
          style={{
            borderColor: "var(--provider-slate-light)",
            backgroundColor: "var(--provider-surface)",
          }}
        >
          <ProviderSearchBar value={query} onChange={setQuery} />
          <ProviderFilters
            region={region}
            specialty={specialty}
            onRegionChange={setRegion}
            onSpecialtyChange={setSpecialty}
            onClear={handleClearFilters}
          />
        </div>

        {/* Results */}
        <ProviderResultsTable providers={filtered} total={filtered.length} />
      </div>
    </AppShell>
  )
}
