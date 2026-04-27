"use client"

import Link from "next/link"

import { SubmitButton } from "@/components/submit-button"
import { Badge } from "@/components/ui/badge"
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
import { useDashboardOverviewQuery } from "@/hooks/use-dashboard-overview-query"
import { createEventAction } from "@/lib/actions"
import { formatDateTime, formatProfession } from "@/lib/formatters"
import type { DashboardOverviewDto } from "@/lib/query-contracts"

type HomeOverviewClientProps = {
  initialData: DashboardOverviewDto
  hasDatabase: boolean
  user: {
    name?: string | null
  }
}

export function HomeOverviewClient({
  initialData,
  hasDatabase,
  user,
}: HomeOverviewClientProps) {
  const { data, isError, isFetching } = useDashboardOverviewQuery(initialData)

  return (
    <div className="grid gap-6">
      {!hasDatabase ? (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>
              Supabase PostgreSQL still needs to be connected
            </CardTitle>
            <CardDescription>
              The UI, auth route, and Drizzle schema are ready, but the app
              needs a live PostgreSQL connection to save users, events, and
              attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Set `DATABASE_URL` in your local environment.</p>
            <p>Run the generated Drizzle migration against Supabase.</p>
            <p>Keep Google credentials in `.env` for sign-in.</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Events created</CardDescription>
            <CardTitle className="text-3xl">{data.stats.totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total check-ins</CardDescription>
            <CardTitle className="text-3xl">
              {data.stats.totalCheckIns}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              Inventory units tracked
              {isFetching ? <span className="text-xs">Refreshing…</span> : null}
            </CardDescription>
            <CardTitle className="text-3xl">
              {data.stats.totalInventory}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create a new event</CardTitle>
            <CardDescription>
              Set up the schedule, dashboard, and QR-based check-in flow for the
              next medical event you are managing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createEventAction} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Event name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="PMA Regional Convention 2026"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="startAt" className="text-sm font-medium">
                    Start date and time
                  </label>
                  <Input
                    id="startAt"
                    name="startAt"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="endAt" className="text-sm font-medium">
                    End date and time
                  </label>
                  <Input id="endAt" name="endAt" type="datetime-local" />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="location"
                  name="location"
                  placeholder="SMX Convention Center, Davao"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Clinical updates, breakout sessions, and sponsor booths."
                />
              </div>
              <SubmitButton
                type="submit"
                className="w-full sm:w-fit"
                pendingText="Creating event..."
              >
                Create event dashboard
              </SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin readiness</CardTitle>
            <CardDescription>
              Complete your own attendee record so your QR and check-in profile
              look polished.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-5">
              <div className="text-sm text-muted-foreground">Admin profile</div>
              <div className="mt-1 text-xl font-semibold">
                {data.profile?.name ?? user.name}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatProfession(data.profile?.profession)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-5">
              <div className="text-sm text-muted-foreground">PRC number</div>
              <div className="mt-1 text-xl font-semibold">
                {data.profile?.prcNumber ?? "Add from profile page"}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="flex-1 sm:flex-none">
                <Link href="/profile">Edit profile</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 sm:flex-none">
                <Link href="/my-qr">View my QR</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {data.events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {formatDateTime(event.startAt)}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{event.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {event.description ?? "No description yet."}
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="font-medium text-foreground">
                    {event.attendeeCount}
                  </div>
                  <div>Check-ins</div>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="font-medium text-foreground">
                    {event.itemCount}
                  </div>
                  <div>Inventory</div>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="font-medium text-foreground">
                    {event.inventoryRemaining}
                  </div>
                  <div>Remaining</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/events/${event.id}`}>Open dashboard</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/events/${event.id}/scanner`}>Open scanner</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.events.length === 0 ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>No events yet</CardTitle>
              <CardDescription>
                Your first event dashboard will appear here after you create it.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </section>

      {isError ? (
        <p className="text-sm text-destructive">
          Live refresh failed. Showing the last available dashboard snapshot.
        </p>
      ) : null}
    </div>
  )
}
