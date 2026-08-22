import { AppShell } from "@/components/layout/app-shell"
import { DoctorDemoScript } from "@/components/demo/doctor-demo-script"
import { PanelSignalsWidget } from "@/components/dashboard/panel-signals-widget"
import { ClinicalPrioritiesPanel } from "@/components/dashboard/clinical-priorities-panel"
import { DoctorDashboardHeader } from "@/components/dashboard/doctor-dashboard-header"
import { TodaySummaryStrip } from "@/components/dashboard/today-summary-strip"

export default function DoctorDashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <DoctorDashboardHeader />
        <DoctorDemoScript />
        <ClinicalPrioritiesPanel />
        <TodaySummaryStrip />
        <PanelSignalsWidget />
      </div>
    </AppShell>
  )
}
