import type { EventDashboardData, HomePageData } from "@/lib/queries"

type DashboardProfileDto = {
  name: string | null
  profession: string | null
  prcNumber: string | null
}

type DashboardEventCardDto = {
  id: string
  slug: string
  name: string
  description: string | null
  location: string | null
  startAt: string
  status: string
  attendeeCount: number
  itemCount: number
  inventoryRemaining: number
}

export type DashboardOverviewDto = {
  profile: DashboardProfileDto | null
  events: DashboardEventCardDto[]
  stats: {
    totalEvents: number
    totalCheckIns: number
    totalInventory: number
  }
}

export type EventDashboardDto = {
  event: {
    id: string
    slug: string
    name: string
    description: string | null
    location: string | null
    startAt: string
    endAt: string | null
    status: string
  }
  attendees: Array<{
    id: string
    attendeeId: string
    publicId: string
    name: string | null
    email: string
    prcNumber: string | null
    profession: string | null
    organization: string | null
    checkedInAt: string
    status: string
  }>
  inventory: Array<{
    id: string
    name: string
    category: string | null
    notes: string | null
    stock: number
    claimed: number
    remaining: number
    createdAt: string
  }>
  stats: {
    totalAttendees: number
    totalInventory: number
    totalClaimed: number
  }
}

export function serializeHomePageData(
  data: HomePageData
): DashboardOverviewDto {
  return {
    profile: data.profile
      ? {
          name: data.profile.name,
          profession: data.profile.profession,
          prcNumber: data.profile.prcNumber,
        }
      : null,
    events: data.events.map((event) => ({
      ...event,
      startAt: event.startAt.toISOString(),
    })),
    stats: data.stats,
  }
}

export function serializeEventDashboard(
  data: EventDashboardData
): EventDashboardDto {
  return {
    event: {
      id: data.event.id,
      slug: data.event.slug,
      name: data.event.name,
      description: data.event.description,
      location: data.event.location,
      startAt: data.event.startAt.toISOString(),
      endAt: data.event.endAt?.toISOString() ?? null,
      status: data.event.status,
    },
    attendees: data.attendees.map((attendee) => ({
      ...attendee,
      checkedInAt: attendee.checkedInAt.toISOString(),
    })),
    inventory: data.inventory.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    stats: data.stats,
  }
}
