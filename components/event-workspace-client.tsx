"use client"

import Link from "next/link"

import { EventDashboardClient } from "@/components/event-dashboard-client"
import { EventJoinQrCard } from "@/components/event-join-qr-card"
import { SubmitButton } from "@/components/submit-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEventDashboardQuery } from "@/hooks/use-event-dashboard-query"
import { addFreebieItemAction } from "@/lib/actions"
import type { EventDashboardDto } from "@/lib/query-contracts"

type EventWorkspaceClientProps = {
  eventId: string
  initialData: EventDashboardDto
  eventName: string
  joinUrl: string
  qrDataUrl: string
}

export function EventWorkspaceClient({
  eventId,
  initialData,
  eventName,
  joinUrl,
  qrDataUrl,
}: EventWorkspaceClientProps) {
  const { data, isError, isFetching } = useEventDashboardQuery(
    eventId,
    initialData
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              Keep the most common event tasks close at hand during live
              check-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              {isFetching ? "Refreshing dashboard..." : "Dashboard synced"}
            </div>
            <div className="grid gap-3">
              <Button asChild className="w-full">
                <Link href={`/events/${eventId}/scanner`}>
                  Scan attendee QR
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/events/${eventId}/join`}>
                  Open attendee sign-in page
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <EventJoinQrCard
          eventName={eventName}
          joinUrl={joinUrl}
          qrDataUrl={qrDataUrl}
        />

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add giveaway inventory</CardTitle>
            <CardDescription>
              Build a live stock list for freebies, certificates, and sponsor
              kits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addFreebieItemAction} className="grid gap-4">
              <input type="hidden" name="eventId" value={eventId} />
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Item name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Lanyard kit"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Input
                  id="category"
                  name="category"
                  placeholder="Starter pack, premium, raffle"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Starting stock
                </label>
                <Input id="stock" name="stock" type="number" min={1} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Reserved for VIP speakers, booth pickup only, etc."
                />
              </div>
              <SubmitButton
                type="submit"
                className="w-full"
                pendingText="Saving inventory..."
              >
                Save inventory item
              </SubmitButton>
            </form>
            {isError ? (
              <p className="mt-4 text-sm text-destructive">
                Live event refresh failed. Showing the last available dashboard
                snapshot.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <EventDashboardClient
        attendees={data.attendees}
        inventory={data.inventory}
      />
    </div>
  )
}
