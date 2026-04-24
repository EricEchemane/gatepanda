"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchJson } from "@/lib/api"
import type { DashboardOverviewDto } from "@/lib/query-contracts"

export function useDashboardOverviewQuery(initialData: DashboardOverviewDto) {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () =>
      fetchJson<DashboardOverviewDto>("/api/dashboard/overview", {
        cache: "no-store",
      }),
    initialData,
  })
}
