import Link from "next/link"

import { AppShell } from "@/components/app-shell"
import { HomeOverviewClient } from "@/components/home-overview-client"
import { GoogleSignInButton } from "@/components/google-sign-in-button"
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
import { hasDatabase, hasGoogleAuth } from "@/lib/env"
import { serializeHomePageData } from "@/lib/query-contracts"
import { getHomePageData } from "@/lib/queries"

export const dynamic = "force-dynamic"

const featurePoints = [
  "Google sign-in for doctors, nurses, and allied medical staff",
  "Editable attendee profiles with PRC number and organization details",
  "Event dashboards with live attendance records, search, and filters",
  "QR verification flow for secure check-in before adding attendees",
  "Freebie and giveaway inventory tracking per event",
]

export default async function Page() {
  const session = await getCurrentSession()

  if (!session?.user) {
    return (
      <div className="min-h-svh bg-muted/30 px-4 py-6">
        <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-6xl flex-col gap-6">
          <section className="overflow-hidden rounded-xl border bg-background">
            <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
              <div className="space-y-6">
                <Badge className="w-fit" variant="success">
                  Medical events, check-in, and giveaway tracking
                </Badge>
                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                    QR-powered event attendance built for clinical teams.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Gate Panda gives event admins a clean way to register
                    doctors and medical professionals, scan attendee QR codes,
                    confirm their identity, and track freebies from one
                    dashboard.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <GoogleSignInButton
                    configured={hasGoogleAuth}
                    className="w-full sm:w-auto"
                  />
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Link href="#system-flow">See the workflow</Link>
                  </Button>
                </div>
                {!hasGoogleAuth ? (
                  <p className="text-sm text-muted-foreground">
                    Add `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` to enable
                    Google sign-in.
                  </p>
                ) : null}
              </div>

              <Card className="border-primary/15 bg-primary/5">
                <CardHeader>
                  <CardTitle>What the app already supports</CardTitle>
                  <CardDescription>
                    The structure is ready for a Supabase PostgreSQL backend
                    with Drizzle and a QR-based admin check-in flow.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {featurePoints.map((point) => (
                      <li
                        key={point}
                        className="rounded-lg border bg-background/75 px-4 py-3"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="system-flow" className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "1. Professional signs in",
                body: "Each doctor or medical attendee signs in with Google and completes their attendee profile, including PRC number and organization.",
              },
              {
                title: "2. QR identity is generated",
                body: "The app creates a personal QR code that links to an attendee identity page with the information event admins need to verify.",
              },
              {
                title: "3. Event admin scans and confirms",
                body: "At the venue, the admin scans the QR, reviews the attendee profile, confirms the check-in, and sees the record appear in the dashboard immediately.",
              },
            ].map((step) => (
              <Card key={step.title}>
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>
        </div>
      </div>
    )
  }

  const homeData = await getHomePageData(session.user.id)

  return (
    <AppShell
      user={session.user}
      title="Event Operations Overview"
      description="Create medical events, publish attendee QR identities, and monitor attendance and freebie inventory from one place."
      actions={
        <Button asChild variant="outline">
          <Link href="/my-qr">Open my QR</Link>
        </Button>
      }
    >
      <HomeOverviewClient
        initialData={serializeHomePageData(homeData)}
        hasDatabase={hasDatabase}
        user={session.user}
      />
    </AppShell>
  )
}
