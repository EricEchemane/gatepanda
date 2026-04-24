import { env } from "@/lib/env"

export function buildAttendeeQrUrl(publicId: string) {
  return `${env.appUrl.replace(/\/$/, "")}/attendee/${publicId}`
}

export function buildEventJoinQrUrl(eventId: string) {
  return `${env.appUrl.replace(/\/$/, "")}/events/${eventId}/join`
}

export function extractAttendeePublicId(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  try {
    const url = new URL(trimmed)
    const segments = url.pathname.split("/").filter(Boolean)

    if (segments[0] === "attendee" && segments[1]) {
      return segments[1]
    }

    return url.searchParams.get("publicId")
  } catch {
    return trimmed.match(/^[a-zA-Z0-9-]{12,}$/) ? trimmed : null
  }
}
