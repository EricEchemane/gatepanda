"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { attendances, events, freebieItems, users } from "@/drizzle/schema"
import { assertDb } from "@/lib/db"
import { createEventSlug } from "@/lib/ids"
import { requireUser } from "@/lib/auth"

const emptyToNull = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const profileSchema = z.object({
  prcNumber: z.string().trim().max(60).transform(emptyToNull),
  profession: z.enum([
    "doctor",
    "nurse",
    "dentist",
    "pharmacist",
    "medtech",
    "therapist",
    "student",
    "admin",
    "other",
  ]),
  organization: z.string().trim().max(120).transform(emptyToNull),
  phone: z.string().trim().max(40).transform(emptyToNull),
  city: z.string().trim().max(80).transform(emptyToNull),
})

const eventSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).transform(emptyToNull),
  location: z.string().trim().max(160).transform(emptyToNull),
  startAt: z.string().trim().min(1),
  endAt: z.string().trim().transform(emptyToNull),
})

const freebieSchema = z.object({
  eventId: z.string().trim().min(1),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().max(80).transform(emptyToNull),
  stock: z.coerce.number().int().min(1).max(100000),
  notes: z.string().trim().max(240).transform(emptyToNull),
})

export async function updateProfileAction(formData: FormData) {
  const viewer = await requireUser()
  const database = assertDb()

  const parsed = profileSchema.safeParse({
    prcNumber: formData.get("prcNumber"),
    profession: formData.get("profession"),
    organization: formData.get("organization"),
    phone: formData.get("phone"),
    city: formData.get("city"),
  })

  if (!parsed.success) {
    redirect("/profile?error=invalid-profile")
  }

  await database
    .update(users)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, viewer.id))

  revalidatePath("/")
  revalidatePath("/profile")
  revalidatePath("/my-qr")
  redirect("/profile?updated=1")
}

export async function createEventAction(formData: FormData) {
  const viewer = await requireUser()
  const database = assertDb()

  const parsed = eventSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    location: formData.get("location"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  })

  if (!parsed.success) {
    redirect("/?error=invalid-event")
  }

  const [createdEvent] = await database
    .insert(events)
    .values({
      ownerId: viewer.id,
      name: parsed.data.name,
      description: parsed.data.description,
      location: parsed.data.location,
      startAt: new Date(parsed.data.startAt),
      endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : null,
      slug: createEventSlug(parsed.data.name),
      status: "upcoming",
    })
    .returning({
      id: events.id,
    })

  revalidatePath("/")
  redirect(`/events/${createdEvent.id}`)
}

export async function addFreebieItemAction(formData: FormData) {
  const viewer = await requireUser()
  const database = assertDb()

  const parsed = freebieSchema.safeParse({
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    category: formData.get("category"),
    stock: formData.get("stock"),
    notes: formData.get("notes"),
  })

  if (!parsed.success) {
    redirect(`/events/${formData.get("eventId")}?error=invalid-freebie`)
  }

  const event = await database.query.events.findFirst({
    where: and(
      eq(events.id, parsed.data.eventId),
      eq(events.ownerId, viewer.id)
    ),
  })

  if (!event) {
    redirect("/")
  }

  await database.insert(freebieItems).values(parsed.data)

  revalidatePath(`/events/${parsed.data.eventId}`)
  redirect(`/events/${parsed.data.eventId}?stocked=1`)
}

export async function checkInAttendeeAction(formData: FormData) {
  const viewer = await requireUser()
  const database = assertDb()

  const eventId = String(formData.get("eventId") ?? "")
  const attendeeId = String(formData.get("attendeeId") ?? "")

  if (!eventId || !attendeeId) {
    redirect("/")
  }

  const event = await database.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, viewer.id)),
  })

  if (!event) {
    redirect("/")
  }

  await database
    .insert(attendances)
    .values({
      eventId,
      attendeeId,
      scannedById: viewer.id,
      status: "checked_in",
      checkedInAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [attendances.eventId, attendances.attendeeId],
      set: {
        scannedById: viewer.id,
        status: "checked_in",
        checkedInAt: new Date(),
      },
    })

  revalidatePath(`/events/${eventId}`)
  revalidatePath(`/events/${eventId}/verify`)
  redirect(`/events/${eventId}?checkedIn=${attendeeId}`)
}

export async function selfCheckInToEventAction(formData: FormData) {
  const viewer = await requireUser()
  const database = assertDb()

  const eventId = String(formData.get("eventId") ?? "")

  if (!eventId) {
    redirect("/")
  }

  const event = await database.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) {
    redirect("/")
  }

  await database
    .insert(attendances)
    .values({
      eventId,
      attendeeId: viewer.id,
      scannedById: null,
      status: "checked_in",
      checkedInAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [attendances.eventId, attendances.attendeeId],
      set: {
        scannedById: null,
        status: "checked_in",
        checkedInAt: new Date(),
      },
    })

  revalidatePath(`/events/${eventId}`)
  revalidatePath(`/events/${eventId}/join`)
  redirect(`/events/${eventId}/join?checkedIn=1`)
}
