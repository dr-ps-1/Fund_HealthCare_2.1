import { AppShell } from "@/components/layout/app-shell"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { PatientPriorityList } from "@/components/dashboard/patient-priority-list"
import { AlertsFeed } from "@/components/dashboard/alerts-feed"
import { AIInsightsWidget } from "@/components/dashboard/ai-insights-widget"

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your patients and alerts
          </p>
        </div>

        <SummaryCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PatientPriorityList />
          </div>
          <div className="flex flex-col gap-6">
            <AIInsightsWidget />
          </div>
        </div>

        <AlertsFeed />
      </div>
    </AppShell>
  )
}
