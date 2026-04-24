"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAttendanceFilters } from "@/hooks/use-attendance-filters"
import {
  formatDateTime,
  formatProfession,
  formatRelativeTime,
} from "@/lib/formatters"

type DashboardProps = {
  eventId: string
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
}

export function EventDashboardClient({
  eventId,
  attendees,
  inventory,
}: DashboardProps) {
  const { query, setQuery, status, setStatus, filteredRows, counts } =
    useAttendanceFilters(attendees)

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Check-ins</CardDescription>
            <CardTitle className="text-3xl">{counts.checkedIn}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Visible in Table</CardDescription>
            <CardTitle className="text-3xl">{counts.visible}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Inventory Remaining</CardDescription>
            <CardTitle className="text-3xl">
              {inventory.reduce((sum, item) => sum + item.remaining, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Attendance Dashboard</CardTitle>
                <CardDescription>
                  Search recent check-ins, verify PRC details, and spot
                  duplicate scans quickly.
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/events/${eventId}/scanner`}>Open scanner</Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_200px]">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search attendee, PRC number, organization"
              />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="checked_in">Checked in</SelectItem>
                  <SelectItem value="voided">Voided</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-3xl border border-border/70">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/60 text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Attendee</th>
                      <th className="px-4 py-3 font-medium">Profession</th>
                      <th className="px-4 py-3 font-medium">PRC</th>
                      <th className="px-4 py-3 font-medium">Checked in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((attendee) => (
                      <tr
                        key={attendee.id}
                        className="border-t border-border/70 bg-background/70"
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {attendee.name ?? attendee.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {attendee.organization ?? attendee.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>{formatProfession(attendee.profession)}</div>
                          <div className="text-xs text-muted-foreground">
                            <Link
                              href={`/attendee/${attendee.publicId}`}
                              className="underline decoration-dotted underline-offset-4"
                            >
                              Public profile
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {attendee.prcNumber ?? "Not supplied"}
                        </td>
                        <td className="px-4 py-4">
                          <div>{formatDateTime(attendee.checkedInAt)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeTime(attendee.checkedInAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          No attendees match the current search and filter.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Snapshot</CardTitle>
            <CardDescription>
              Track freebies and giveaway stock at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-border/70 bg-background/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.category ?? "General freebie"}
                    </div>
                  </div>
                  <Badge variant={item.remaining > 0 ? "success" : "warning"}>
                    {item.remaining} left
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="rounded-2xl bg-muted/60 px-3 py-2">
                    <div className="font-medium text-foreground">
                      {item.stock}
                    </div>
                    <div>Total</div>
                  </div>
                  <div className="rounded-2xl bg-muted/60 px-3 py-2">
                    <div className="font-medium text-foreground">
                      {item.claimed}
                    </div>
                    <div>Claimed</div>
                  </div>
                  <div className="rounded-2xl bg-muted/60 px-3 py-2">
                    <div className="font-medium text-foreground">
                      {item.remaining}
                    </div>
                    <div>Remaining</div>
                  </div>
                </div>
                {item.notes ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.notes}
                  </p>
                ) : null}
              </div>
            ))}
            {inventory.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No freebie inventory has been added yet.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
