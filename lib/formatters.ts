import { format, formatDistanceToNow } from "date-fns"

import type { Profession } from "@/drizzle/schema"

const professionLabels: Record<Profession, string> = {
  doctor: "Doctor",
  nurse: "Nurse",
  dentist: "Dentist",
  pharmacist: "Pharmacist",
  medtech: "Medical Technologist",
  therapist: "Therapist",
  student: "Student",
  admin: "Administrator",
  other: "Other",
}

export function formatProfession(
  value: Profession | string | null | undefined
) {
  if (!value) {
    return "Medical Professional"
  }

  if (value in professionLabels) {
    return professionLabels[value as Profession]
  }

  return "Medical Professional"
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "TBD"
  }

  return format(
    value instanceof Date ? value : new Date(value),
    "MMM d, yyyy h:mm a"
  )
}

export function formatShortDate(value: Date | string | null | undefined) {
  if (!value) {
    return "TBD"
  }

  return format(value instanceof Date ? value : new Date(value), "MMM d, yyyy")
}

export function formatRelativeTime(value: Date | string | null | undefined) {
  if (!value) {
    return "Not yet checked in"
  }

  return formatDistanceToNow(value instanceof Date ? value : new Date(value), {
    addSuffix: true,
  })
}
