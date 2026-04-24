"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useQrScanner } from "@/hooks/use-qr-scanner"

type QrScannerPanelProps = {
  eventId: string
}

export function QrScannerPanel({ eventId }: QrScannerPanelProps) {
  const router = useRouter()
  const regionId = useId().replace(/:/g, "")
  const [manualValue, setManualValue] = useState("")
  const [isPending, startTransition] = useTransition()

  const { status, error } = useQrScanner({
    elementId: regionId,
    enabled: true,
    onScan: (value) => {
      router.push(`/events/${eventId}/verify?code=${encodeURIComponent(value)}`)
    },
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Live scanner</CardTitle>
          <CardDescription>
            Point the admin device camera to an attendee QR code. A successful
            scan opens the verification screen before check-in is confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            id={regionId}
            className="min-h-80 rounded-[2rem] border border-dashed border-primary/30 bg-muted/30"
          />
          <div className="mt-4 text-sm text-muted-foreground">
            Scanner status:{" "}
            <span className="font-medium text-foreground">{status}</span>
          </div>
          {error ? (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual fallback</CardTitle>
          <CardDescription>
            Paste a scanned attendee URL if camera access is blocked on the
            device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={manualValue}
            onChange={(event) => setManualValue(event.target.value)}
            placeholder="https://your-app.com/attendee/public-id"
          />
          <Button
            className="w-full"
            disabled={!manualValue.trim() || isPending}
            onClick={() =>
              startTransition(() => {
                router.push(
                  `/events/${eventId}/verify?code=${encodeURIComponent(
                    manualValue.trim()
                  )}`
                )
              })
            }
          >
            Verify attendee
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
