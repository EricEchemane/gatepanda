import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatProfession } from "@/lib/formatters"
import { getPublicAttendeeProfile } from "@/lib/queries"

export const dynamic = "force-dynamic"

type AttendeePageProps = {
  params: Promise<{
    publicId: string
  }>
}

export default async function AttendeePage({ params }: AttendeePageProps) {
  const { publicId } = await params
  const attendee = await getPublicAttendeeProfile(publicId)

  if (!attendee) {
    notFound()
  }

  return (
    <div className="min-h-svh bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="success">
              Attendee identity verified page
            </Badge>
            <CardTitle className="mt-3 text-3xl">
              {attendee.name ?? attendee.email}
            </CardTitle>
            <CardDescription>
              Event admins can review this public profile after scanning the
              attendee QR code, then confirm check-in inside the event
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Profession</div>
              <div className="mt-1 text-lg font-semibold">
                {formatProfession(attendee.profession)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">PRC number</div>
              <div className="mt-1 text-lg font-semibold">
                {attendee.prcNumber ?? "Not supplied"}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Organization</div>
              <div className="mt-1 text-lg font-semibold">
                {attendee.organization ?? "Independent practice"}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">City</div>
              <div className="mt-1 text-lg font-semibold">
                {attendee.city ?? "Not supplied"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
