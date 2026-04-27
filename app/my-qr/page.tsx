import Link from "next/link"
import { redirect } from "next/navigation"
import QRCode from "qrcode"

import { AppShell } from "@/components/app-shell"
import { SetupCallout } from "@/components/setup-callout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth"
import { hasDatabase } from "@/lib/env"
import { formatProfession } from "@/lib/formatters"
import { getProfileByUserId } from "@/lib/queries"
import { buildAttendeeQrUrl } from "@/lib/qr"

export const dynamic = "force-dynamic"

export default async function MyQrPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    redirect("/")
  }

  const profile = await getProfileByUserId(session.user.id)

  if (!hasDatabase || !profile?.publicId) {
    return (
      <AppShell
        user={session.user}
        title="My Attendee QR"
        description="Generate your attendee QR code so event admins can verify and check you in."
        actions={
          <Button asChild variant="outline">
            <Link href="/profile">Edit profile</Link>
          </Button>
        }
      >
        <SetupCallout
          title="QR generation depends on your attendee profile"
          description="Finish the database setup and save your profile first."
          items={[
            "Configure DATABASE_URL in your environment.",
            "Sign in once Google auth is ready so a user record can be created.",
            "Complete your profile before sharing your QR.",
          ]}
        />
      </AppShell>
    )
  }

  const attendeeUrl = buildAttendeeQrUrl(profile.publicId)
  const qrDataUrl = await QRCode.toDataURL(attendeeUrl, {
    margin: 1,
    width: 480,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  })

  return (
    <AppShell
      user={session.user}
      title="Personal Event QR"
      description="Share this code at the registration desk. Admins scan it, review your details, then confirm your attendance."
      actions={
        <Button asChild variant="outline">
          <Link href="/profile">Edit profile</Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ready to present at the venue</CardTitle>
            <CardDescription>
              The QR points to your public attendee identity page inside the
              app.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="Personal attendee QR code"
              className="w-full max-w-sm rounded-lg border bg-white p-4"
            />
            <div className="w-full rounded-lg border bg-muted/30 p-4 text-sm break-all text-muted-foreground">
              {attendeeUrl}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked attendee details</CardTitle>
            <CardDescription>
              Event admins will see these details before they approve the
              check-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="success">
              {formatProfession(profile.profession)}
            </Badge>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="mt-1 text-xl font-semibold">
                {profile.name ?? session.user.name}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">PRC number</div>
              <div className="mt-1 text-xl font-semibold">
                {profile.prcNumber ?? "Not supplied yet"}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Organization</div>
              <div className="mt-1 text-xl font-semibold">
                {profile.organization ?? "Independent practice"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
