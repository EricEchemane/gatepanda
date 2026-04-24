import { and, desc, eq, inArray } from "drizzle-orm"

import {
  attendances,
  events,
  freebieClaims,
  freebieItems,
  users,
} from "@/drizzle/schema"
import { db } from "@/lib/db"
import { extractAttendeePublicId } from "@/lib/qr"

type HomeEventCard = {
  id: string
  slug: string
  name: string
  description: string | null
  location: string | null
  startAt: Date
  status: string
  attendeeCount: number
  itemCount: number
  inventoryRemaining: number
}

export async function getHomePageData(userId: string | undefined) {
  if (!userId || !db) {
    return {
      profile: null,
      events: [] as HomeEventCard[],
      stats: {
        totalEvents: 0,
        totalCheckIns: 0,
        totalInventory: 0,
      },
    }
  }

  const [profile, ownedEvents] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
    db
      .select()
      .from(events)
      .where(eq(events.ownerId, userId))
      .orderBy(desc(events.startAt)),
  ])

  const eventIds = ownedEvents.map((event) => event.id)

  const [attendanceRows, inventoryRows, claimRows] =
    eventIds.length > 0
      ? await Promise.all([
          db
            .select({
              eventId: attendances.eventId,
            })
            .from(attendances)
            .where(inArray(attendances.eventId, eventIds)),
          db
            .select({
              eventId: freebieItems.eventId,
              stock: freebieItems.stock,
            })
            .from(freebieItems)
            .where(inArray(freebieItems.eventId, eventIds)),
          db
            .select({
              eventId: freebieClaims.eventId,
            })
            .from(freebieClaims)
            .where(inArray(freebieClaims.eventId, eventIds)),
        ])
      : [[], [], []]

  const attendanceMap = new Map<string, number>()
  const inventoryMap = new Map<string, number>()
  const claimMap = new Map<string, number>()

  for (const row of attendanceRows) {
    attendanceMap.set(row.eventId, (attendanceMap.get(row.eventId) ?? 0) + 1)
  }

  for (const row of inventoryRows) {
    inventoryMap.set(
      row.eventId,
      (inventoryMap.get(row.eventId) ?? 0) + row.stock
    )
  }

  for (const row of claimRows) {
    claimMap.set(row.eventId, (claimMap.get(row.eventId) ?? 0) + 1)
  }

  const eventCards = ownedEvents.map((event) => {
    const attendeeCount = attendanceMap.get(event.id) ?? 0
    const totalStock = inventoryMap.get(event.id) ?? 0
    const claimed = claimMap.get(event.id) ?? 0

    return {
      id: event.id,
      slug: event.slug,
      name: event.name,
      description: event.description,
      location: event.location,
      startAt: event.startAt,
      status: event.status,
      attendeeCount,
      itemCount: totalStock,
      inventoryRemaining: Math.max(totalStock - claimed, 0),
    }
  })

  return {
    profile,
    events: eventCards,
    stats: {
      totalEvents: eventCards.length,
      totalCheckIns: attendanceRows.length,
      totalInventory: inventoryRows.reduce((sum, item) => sum + item.stock, 0),
    },
  }
}

export async function getProfileByUserId(userId: string) {
  if (!db) {
    return null
  }

  return db.query.users.findFirst({
    where: eq(users.id, userId),
  })
}

export async function getPublicAttendeeProfile(publicId: string) {
  if (!db) {
    return null
  }

  return db.query.users.findFirst({
    where: eq(users.publicId, publicId),
  })
}

export async function getEventDashboard(eventId: string, ownerId: string) {
  if (!db) {
    return null
  }

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, ownerId)),
  })

  if (!event) {
    return null
  }

  const [attendanceRows, inventoryRows, claimRows] = await Promise.all([
    db
      .select({
        id: attendances.id,
        attendeeId: users.id,
        publicId: users.publicId,
        name: users.name,
        email: users.email,
        prcNumber: users.prcNumber,
        profession: users.profession,
        organization: users.organization,
        checkedInAt: attendances.checkedInAt,
        status: attendances.status,
      })
      .from(attendances)
      .innerJoin(users, eq(attendances.attendeeId, users.id))
      .where(eq(attendances.eventId, eventId))
      .orderBy(desc(attendances.checkedInAt)),
    db
      .select()
      .from(freebieItems)
      .where(eq(freebieItems.eventId, eventId))
      .orderBy(desc(freebieItems.createdAt)),
    db
      .select({
        itemId: freebieClaims.itemId,
        attendeeId: freebieClaims.attendeeId,
      })
      .from(freebieClaims)
      .where(eq(freebieClaims.eventId, eventId)),
  ])

  const claimCountMap = new Map<string, number>()

  for (const claim of claimRows) {
    claimCountMap.set(claim.itemId, (claimCountMap.get(claim.itemId) ?? 0) + 1)
  }

  const inventory = inventoryRows.map((item) => {
    const claimed = claimCountMap.get(item.id) ?? 0

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      notes: item.notes,
      stock: item.stock,
      claimed,
      remaining: Math.max(item.stock - claimed, 0),
      createdAt: item.createdAt,
    }
  })

  return {
    event,
    attendees: attendanceRows,
    inventory,
    stats: {
      totalAttendees: attendanceRows.length,
      totalInventory: inventory.reduce((sum, item) => sum + item.stock, 0),
      totalClaimed: inventory.reduce((sum, item) => sum + item.claimed, 0),
    },
  }
}

export async function getVerificationPayload(
  eventId: string,
  ownerId: string,
  scannedValue: string | undefined
) {
  if (!db || !scannedValue) {
    return null
  }

  const publicId = extractAttendeePublicId(scannedValue)

  if (!publicId) {
    return {
      event: null,
      attendee: null,
      attendance: null,
      invalid: true,
    }
  }

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, ownerId)),
  })

  if (!event) {
    return null
  }

  const attendee = await db.query.users.findFirst({
    where: eq(users.publicId, publicId),
  })

  if (!attendee) {
    return {
      event,
      attendee: null,
      attendance: null,
      invalid: true,
    }
  }

  const attendance = await db.query.attendances.findFirst({
    where: and(
      eq(attendances.eventId, event.id),
      eq(attendances.attendeeId, attendee.id)
    ),
  })

  return {
    event,
    attendee,
    attendance,
    invalid: false,
  }
}

export async function getEventJoinPageData(
  eventId: string,
  attendeeId?: string
) {
  if (!db) {
    return null
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      owner: true,
    },
  })

  if (!event) {
    return null
  }

  const attendance = attendeeId
    ? await db.query.attendances.findFirst({
        where: and(
          eq(attendances.eventId, eventId),
          eq(attendances.attendeeId, attendeeId)
        ),
      })
    : null

  return {
    event,
    attendance,
  }
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>
export type EventDashboardData = NonNullable<
  Awaited<ReturnType<typeof getEventDashboard>>
>
