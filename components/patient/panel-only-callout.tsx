import Link from "next/link"
import { Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DEMO_SECONDARY_PATIENT_ID,
  DEMO_STAR_PATIENT_ID,
} from "@/lib/demo-patients"

export function PanelOnlyCallout({ patientName }: { patientName: string }) {
  return (
    <Card className="border-border bg-muted/40">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Limited chart view</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Summary demographics and risk are available for panel triage. Open a
              connected member chart for pre-visit brief, timeline, and remote
              monitoring data.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={`/patients/${DEMO_STAR_PATIENT_ID}?brief=1`}>
            <Button size="sm" variant="default">
              Ava Jackson — RPM
            </Button>
          </Link>
          <Link href={`/patients/${DEMO_SECONDARY_PATIENT_ID}?brief=1`}>
            <Button size="sm" variant="outline">
              Sarah Johnson — urgent
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
