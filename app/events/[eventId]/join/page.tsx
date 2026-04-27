import Link from "next/link"
import { notFound } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { GoogleSignInButton } from "@/components/google-sign-in-button"
import { SetupCallout } from "@/components/setup-callout"
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
import { selfCheckInToEventAction } from "@/lib/actions"
import { getCurrentSession } from "@/lib/auth"
import { hasDatabase, hasGoogleAuth } from "@/lib/env"
import {
  formatDateTime,
  formatProfession,
  formatRelativeTime,
} from "@/lib/formatters"
import { getEventJoinPageData, getProfileByUserId } from "@/lib/queries"

export const dynamic = "force-dynamic"

type EventJoinPageProps = {
  params: Promise<{
    eventId: string
  }>
}

export default async function EventJoinPage({ params }: EventJoinPageProps) {
  const { eventId } = await params
  const session = await getCurrentSession()

  if (!hasDatabase) {
    return (
      <AppShell
        user={session?.user}
        title="Event Sign-in"
        description="This event sign-in page needs the database connection before attendees can join."
      >
        <SetupCallout
          title="Database setup needed"
          description="Event QR sign-in needs your PostgreSQL connection."
          items={[
            "Set DATABASE_URL in your local environment.",
            "Run a Drizzle migration or push the schema before using event sign-in.",
          ]}
        />
      </AppShell>
    )
  }

  const joinData = await getEventJoinPageData(eventId, session?.user?.id)

  if (!joinData) {
    notFound()
  }

  const profile = session?.user?.id
    ? await getProfileByUserId(session.user.id)
    : null

  if (!session?.user?.id) {
    return (
      <AppShell
        title={`Join ${joinData.event.name}`}
        description="Scan this event QR, sign in with Google, and confirm your attendance."
      >
        <div className="mx-auto grid max-w-2xl gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{joinData.event.name}</CardTitle>
              <CardDescription>
                {formatDateTime(joinData.event.startAt)}
                {joinData.event.location ? ` • ${joinData.event.location}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Hosted by{" "}
                <span className="font-medium text-foreground">
                  {joinData.event.owner.name ?? joinData.event.owner.email}
                </span>
                . Sign in to record your attendance.
              </p>
              <GoogleSignInButton
                configured={hasGoogleAuth}
                callbackUrl={`/events/${eventId}/join`}
              />
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      user={session.user}
      title={`Join ${joinData.event.name}`}
      description="Confirm your attendance after scanning the organizer's event QR code."
      actions={
        <Button asChild variant="outline">
          <Link href="/">Back to dashboard</Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Attendance status</CardTitle>
            <CardDescription>
              Your sign-in here appears in the event creator&apos;s attendance
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {joinData.attendance ? (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="font-medium text-foreground">
                  You are already signed in for this event.
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Recorded {formatDateTime(joinData.attendance.checkedInAt)} (
                  {formatRelativeTime(joinData.attendance.checkedInAt)}).
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="font-medium text-foreground">
                  You have not signed in yet.
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Tap the button below to add yourself to the attendance list.
                </div>
              </div>
            )}

            <form action={selfCheckInToEventAction} className="grid gap-3">
              <input type="hidden" name="eventId" value={joinData.event.id} />
              <SubmitButton
                type="submit"
                className="w-full"
                pendingText={
                  joinData.attendance
                    ? "Refreshing attendance..."
                    : "Signing into event..."
                }
              >
                {joinData.attendance
                  ? "Refresh my check-in time"
                  : "Sign me into this event"}
              </SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Attendee self-check-in</Badge>
              <Badge variant="success">
                {formatProfession(profile?.profession)}
              </Badge>
            </div>
            <CardTitle className="text-3xl">{joinData.event.name}</CardTitle>
            <CardDescription>
              Review the event details below, then add yourself to the
              attendance list.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Attendee name</div>
              <div className="mt-1 text-lg font-semibold">
                {profile?.name ?? session.user.name ?? session.user.email}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">PRC number</div>
              <div className="mt-1 text-lg font-semibold">
                {profile?.prcNumber ?? "Not supplied"}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Event date</div>
              <div className="mt-1 text-lg font-semibold">
                {formatDateTime(joinData.event.startAt)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Hosted by</div>
              <div className="mt-1 text-lg font-semibold">
                {joinData.event.owner.name ?? joinData.event.owner.email}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
