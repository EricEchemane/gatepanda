import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
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
import { checkInAttendeeAction } from "@/lib/actions"
import { getCurrentSession } from "@/lib/auth"
import {
  formatDateTime,
  formatProfession,
  formatRelativeTime,
} from "@/lib/formatters"
import { getVerificationPayload } from "@/lib/queries"

export const dynamic = "force-dynamic"

type VerifyPageProps = {
  params: Promise<{
    eventId: string
  }>
  searchParams: Promise<{
    code?: string
  }>
}

export default async function VerifyPage({
  params,
  searchParams,
}: VerifyPageProps) {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    redirect("/")
  }

  const { eventId } = await params
  const { code } = await searchParams
  const payload = await getVerificationPayload(eventId, session.user.id, code)

  if (!payload) {
    notFound()
  }

  return (
    <AppShell
      user={session.user}
      title="Verify scanned attendee"
      description="Review the attendee profile from the scanned QR code before recording the event check-in."
      actions={
        <Button asChild variant="outline">
          <Link href={`/events/${eventId}/scanner`}>Scan another code</Link>
        </Button>
      }
    >
      {payload.invalid || !payload.attendee || !payload.event ? (
        <Card>
          <CardHeader>
            <CardTitle>Scanned code could not be matched</CardTitle>
            <CardDescription>
              The QR did not resolve to a valid attendee profile in this system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/events/${eventId}/scanner`}>Return to scanner</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="success">
                  {formatProfession(payload.attendee.profession)}
                </Badge>
                {payload.attendance ? (
                  <Badge variant="warning">Already checked in</Badge>
                ) : (
                  <Badge variant="secondary">Ready to check in</Badge>
                )}
              </div>
              <CardTitle className="text-3xl">
                {payload.attendee.name ?? payload.attendee.email}
              </CardTitle>
              <CardDescription>
                Confirm this attendee belongs to the event, then record the QR
                scan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-5">
                <div className="text-sm text-muted-foreground">PRC number</div>
                <div className="mt-1 text-lg font-semibold">
                  {payload.attendee.prcNumber ?? "Not supplied"}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-5">
                <div className="text-sm text-muted-foreground">
                  Organization
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {payload.attendee.organization ?? "Independent practice"}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-5">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="mt-1 text-lg font-semibold">
                  {payload.attendee.email}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-5">
                <div className="text-sm text-muted-foreground">
                  Public attendee page
                </div>
                <div className="mt-1 text-lg font-semibold">
                  <Link
                    href={`/attendee/${payload.attendee.publicId}`}
                    className="underline decoration-dotted underline-offset-4"
                  >
                    Open profile
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check-in confirmation</CardTitle>
              <CardDescription>
                Once confirmed, the attendee is added to the event attendance
                table.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-5">
                <div className="text-sm text-muted-foreground">Event</div>
                <div className="mt-1 text-lg font-semibold">
                  {payload.event.name}
                </div>
              </div>
              {payload.attendance ? (
                <div className="rounded-lg border bg-muted/50 p-5 text-sm">
                  <div className="font-medium text-foreground">
                    This attendee has already been checked in.
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    Recorded {formatDateTime(payload.attendance.checkedInAt)} (
                    {formatRelativeTime(payload.attendance.checkedInAt)}).
                  </div>
                </div>
              ) : null}
              <form action={checkInAttendeeAction} className="grid gap-3">
                <input type="hidden" name="eventId" value={payload.event.id} />
                <input
                  type="hidden"
                  name="attendeeId"
                  value={payload.attendee.id}
                />
                <SubmitButton
                  type="submit"
                  className="w-full"
                  pendingText={
                    payload.attendance
                      ? "Refreshing check-in..."
                      : "Confirming check-in..."
                  }
                >
                  {payload.attendance
                    ? "Refresh check-in timestamp"
                    : "Confirm check-in"}
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  )
}
