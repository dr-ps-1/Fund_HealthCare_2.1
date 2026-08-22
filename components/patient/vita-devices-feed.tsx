"use client"

import { RefreshCw, Watch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { VitaDeviceSnapshot } from "@/lib/vita-device-readings"
import { formatVitaDeviceSyncLabel } from "@/lib/vita-device-readings"

export function VitaDevicesFeed({
  snapshot,
  syncing,
  onSync,
}: {
  snapshot: VitaDeviceSnapshot
  syncing: boolean
  onSync: () => void
}) {
  return (
    <div className="mb-5 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Vita connected devices
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Same Withings and Dexcom readings Ava sees in Devices & Sensors.
            Last synced {formatVitaDeviceSyncLabel(snapshot.lastSyncedAt)}.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onSync}
          disabled={syncing}
          className="shrink-0"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {snapshot.justSynced ? "Sync again" : "Sync from Vita"}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {snapshot.connections.map((device) => (
          <Badge key={device.name} variant="outline" className="gap-1.5">
            <Watch className="h-3 w-3" />
            {device.name}
            <span className="text-[#16A34A]">Connected</span>
          </Badge>
        ))}
        {snapshot.justSynced && (
          <Badge className="bg-primary text-primary-foreground">Just synced</Badge>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {snapshot.measurements.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-2 rounded-md border border-border bg-card px-3 py-2"
          >
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {item.value}{" "}
                <span className="font-medium text-muted-foreground">
                  {item.unit}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="text-[10px]">
                From device
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {item.source}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
