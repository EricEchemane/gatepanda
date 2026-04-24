import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { QrScannerPanel } from "@/components/qr-scanner-panel"
import { Button } from "@/components/ui/button"
import { getCurrentSession } from "@/lib/auth"
import { getEventDashboard } from "@/lib/queries"

export const dynamic = "force-dynamic"

type ScannerPageProps = {
  params: Promise<{
    eventId: string
  }>
}

export default async function ScannerPage({ params }: ScannerPageProps) {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    redirect("/")
  }

  const { eventId } = await params
  const dashboard = await getEventDashboard(eventId, session.user.id)

  if (!dashboard) {
    notFound()
  }

  return (
    <AppShell
      user={session.user}
      title={`Scan for ${dashboard.event.name}`}
      description="Use the device camera to read attendee QR codes, then confirm the attendee details before check-in."
      actions={
        <Button asChild variant="outline">
          <Link href={`/events/${eventId}`}>Back to dashboard</Link>
        </Button>
      }
    >
      <QrScannerPanel eventId={eventId} />
    </AppShell>
  )
}
