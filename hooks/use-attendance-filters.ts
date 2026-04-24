"use client"

import { useDeferredValue, useMemo, useState } from "react"

type AttendanceRow = {
  id: string
  publicId: string
  name: string | null
  email: string
  prcNumber: string | null
  profession: string | null
  organization: string | null
  checkedInAt: Date | string
  status: string
}

export function useAttendanceFilters(rows: AttendanceRow[]) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  const deferredQuery = useDeferredValue(query)

  const filteredRows = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    return rows.filter((row) => {
      const matchesStatus = status === "all" ? true : row.status === status
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : [
              row.name,
              row.email,
              row.prcNumber,
              row.profession,
              row.organization,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value).toLowerCase().includes(normalizedQuery)
              )

      return matchesStatus && matchesQuery
    })
  }, [deferredQuery, rows, status])

  return {
    query,
    setQuery,
    status,
    setStatus,
    filteredRows,
    counts: {
      total: rows.length,
      visible: filteredRows.length,
      checkedIn: rows.filter((row) => row.status === "checked_in").length,
    },
  }
}
