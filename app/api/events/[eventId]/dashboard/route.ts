import { NextResponse } from "next/server"

import { getCurrentSession } from "@/lib/auth"
import { serializeEventDashboard } from "@/lib/query-contracts"
import { getEventDashboard } from "@/lib/queries"

type EventDashboardRouteProps = {
  params: Promise<{
    eventId: string
  }>
}

export async function GET(
  _request: Request,
  { params }: EventDashboardRouteProps
) {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", {
      status: 401,
    })
  }

  const { eventId } = await params
  const dashboard = await getEventDashboard(eventId, session.user.id)

  if (!dashboard) {
    return new NextResponse("Not found", {
      status: 404,
    })
  }

  return NextResponse.json(serializeEventDashboard(dashboard))
}
