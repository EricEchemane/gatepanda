import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { EventWorkspaceClient } from "@/components/event-workspace-client"
import { SetupCallout } from "@/components/setup-callout"
import { Button } from "@/components/ui/button"
import { getCurrentSession } from "@/lib/auth"
import { hasDatabase } from "@/lib/env"
import { formatDateTime } from "@/lib/formatters"
import { serializeEventDashboard } from "@/lib/query-contracts"
import { getEventDashboard } from "@/lib/queries"

export const dynamic = "force-dynamic"

type EventDashboardPageProps = {
  params: Promise<{
    eventId: string
  }>
}

export default async function EventDashboardPage({
  params,
}: EventDashboardPageProps) {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    redirect("/")
  }

  const { eventId } = await params

  if (!hasDatabase) {
    return (
      <AppShell
        user={session.user}
        title="Event Dashboard"
        description="Database setup is required before event dashboards can load."
      >
        <SetupCallout
          title="Connect Supabase PostgreSQL first"
          description="This dashboard uses Drizzle queries against your PostgreSQL database."
          items={[
            "Set DATABASE_URL in .env.",
            "Generate and run the Drizzle migration.",
            "Sign in again after Google auth is configured.",
          ]}
        />
      </AppShell>
    )
  }

  const dashboard = await getEventDashboard(eventId, session.user.id)

  if (!dashboard) {
    notFound()
  }

  return (
    <AppShell
      user={session.user}
      title={dashboard.event.name}
      description={`${formatDateTime(dashboard.event.startAt)}${dashboard.event.location ? ` • ${dashboard.event.location}` : ""}`}
      actions={
        <Button asChild>
          <Link href={`/events/${eventId}/scanner`}>Scan attendees</Link>
        </Button>
      }
    >
      <EventWorkspaceClient
        eventId={eventId}
        initialData={serializeEventDashboard(dashboard)}
      />
    </AppShell>
  )
}
