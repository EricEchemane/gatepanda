"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAttendanceFilters } from "@/hooks/use-attendance-filters"
import {
  formatDateTime,
  formatProfession,
  formatRelativeTime,
} from "@/lib/formatters"

type DashboardProps = {
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

export function EventDashboardClient({ attendees, inventory }: DashboardProps) {
  const { query, setQuery, status, setStatus, filteredRows, counts } =
    useAttendanceFilters(attendees)

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total check-ins</CardDescription>
            <CardTitle className="text-3xl">{counts.checkedIn}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Visible in table</CardDescription>
            <CardTitle className="text-3xl">{counts.visible}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Inventory remaining</CardDescription>
            <CardTitle className="text-3xl">
              {inventory.reduce((sum, item) => sum + item.remaining, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="gap-4">
            <div>
              <CardTitle>Attendance dashboard</CardTitle>
              <CardDescription>
                Search recent check-ins, verify PRC details, and spot duplicate
                scans quickly.
              </CardDescription>
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
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead className="w-[160px]">Checked in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell>
                        <div className="font-medium">
                          {attendee.name ?? attendee.email}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatProfession(attendee.profession)}
                          {attendee.prcNumber
                            ? ` • PRC ${attendee.prcNumber}`
                            : " • PRC not supplied"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {attendee.organization ?? attendee.email}
                        </div>
                        <Link
                          href={`/attendee/${attendee.publicId}`}
                          className="mt-2 inline-block text-xs underline decoration-dotted underline-offset-4"
                        >
                          Open public profile
                        </Link>
                      </TableCell>
                      <TableCell className="align-top">
                        <div>{formatDateTime(attendee.checkedInAt)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatRelativeTime(attendee.checkedInAt)}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          {attendee.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No attendees match the current search and filter.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory snapshot</CardTitle>
            <CardDescription>
              Track freebies and giveaway stock at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventory.map((item) => (
              <div key={item.id} className="rounded-lg border bg-muted/20 p-4">
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
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <div className="font-medium text-foreground">
                      {item.stock}
                    </div>
                    <div>Total</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <div className="font-medium text-foreground">
                      {item.claimed}
                    </div>
                    <div>Claimed</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
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
              <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No freebie inventory has been added yet.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
