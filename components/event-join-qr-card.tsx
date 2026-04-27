import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type EventJoinQrCardProps = {
  eventName: string
  joinUrl: string
  qrDataUrl: string
}

export function EventJoinQrCard({
  eventName,
  joinUrl,
  qrDataUrl,
}: EventJoinQrCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendee Sign-in QR</CardTitle>
        <CardDescription>
          Let attendees scan this event QR with their own phone to sign
          themselves into {eventName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center rounded-lg border bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`Join ${eventName} QR code`}
            className="w-full max-w-xs"
          />
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          Ask attendees to open their camera and scan this code.
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm break-all text-muted-foreground">
          {joinUrl}
        </div>
      </CardContent>
    </Card>
  )
}
