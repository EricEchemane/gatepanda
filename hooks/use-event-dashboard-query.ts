"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchJson } from "@/lib/api"
import type { EventDashboardDto } from "@/lib/query-contracts"

export function useEventDashboardQuery(
  eventId: string,
  initialData: EventDashboardDto
) {
  return useQuery({
    queryKey: ["events", eventId, "dashboard"],
    queryFn: () =>
      fetchJson<EventDashboardDto>(`/api/events/${eventId}/dashboard`, {
        cache: "no-store",
      }),
    initialData,
  })
}
