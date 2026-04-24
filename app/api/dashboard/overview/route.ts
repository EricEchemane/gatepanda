import { NextResponse } from "next/server"

import { getCurrentSession } from "@/lib/auth"
import { getHomePageData } from "@/lib/queries"
import { serializeHomePageData } from "@/lib/query-contracts"

export async function GET() {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", {
      status: 401,
    })
  }

  const data = await getHomePageData(session.user.id)

  return NextResponse.json(serializeHomePageData(data))
}
