"use client"

import Link from "next/link"

import { EventDashboardClient } from "@/components/event-dashboard-client"
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
}

export function EventWorkspaceClient({
  eventId,
  initialData,
}: EventWorkspaceClientProps) {
  const { data, isError, isFetching } = useEventDashboardQuery(
    eventId,
    initialData
  )

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {isFetching ? "Refreshing dashboard..." : "Dashboard synced"}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/events/${eventId}/scanner`}>Scan attendees</Link>
            </Button>
          </div>

          <EventDashboardClient
            eventId={eventId}
            attendees={data.attendees}
            inventory={data.inventory}
          />
        </div>

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
              <Button type="submit" className="w-full">
                Save inventory item
              </Button>
            </form>
            {isError ? (
              <p className="mt-4 text-sm text-destructive">
                Live event refresh failed. Showing the last available dashboard
                snapshot.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
