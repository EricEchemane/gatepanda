import { relations, sql } from "drizzle-orm"
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

const createId = () => crypto.randomUUID()

export const professionEnum = pgEnum("profession", [
  "doctor",
  "nurse",
  "dentist",
  "pharmacist",
  "medtech",
  "therapist",
  "student",
  "admin",
  "other",
])

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "upcoming",
  "live",
  "completed",
])

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "checked_in",
  "voided",
])

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    publicId: text("public_id").notNull().$defaultFn(createId),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", {
      mode: "date",
      withTimezone: true,
    }),
    image: text("image"),
    prcNumber: text("prc_number"),
    profession: professionEnum("profession").default("doctor").notNull(),
    organization: text("organization"),
    phone: text("phone"),
    city: text("city"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_public_id_unique").on(table.publicId),
  ]
)

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  ]
)

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    uniqueIndex("sessions_session_token_unique").on(table.sessionToken),
  ]
)

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.identifier, table.token],
    }),
  ]
)

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    slug: text("slug").notNull().$defaultFn(createId),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    location: text("location"),
    startAt: timestamp("start_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    endAt: timestamp("end_at", { mode: "date", withTimezone: true }),
    status: eventStatusEnum("status").default("upcoming").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("events_slug_unique").on(table.slug)]
)

export const attendances = pgTable(
  "attendances",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    attendeeId: text("attendee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scannedById: text("scanned_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: attendanceStatusEnum("status").default("checked_in").notNull(),
    checkedInAt: timestamp("checked_in_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("attendances_event_attendee_unique").on(
      table.eventId,
      table.attendeeId
    ),
  ]
)

export const freebieItems = pgTable("freebie_items", {
  id: text("id").primaryKey().$defaultFn(createId),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category"),
  notes: text("notes"),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})

export const freebieClaims = pgTable(
  "freebie_claims",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => freebieItems.id, { onDelete: "cascade" }),
    attendeeId: text("attendee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    claimedById: text("claimed_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    claimedAt: timestamp("claimed_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("freebie_claims_item_attendee_unique").on(
      table.itemId,
      table.attendeeId
    ),
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  events: many(events),
  attendances: many(attendances, {
    relationName: "attendance_attendee",
  }),
  scannedAttendances: many(attendances, {
    relationName: "attendance_scanner",
  }),
  freebieClaims: many(freebieClaims, {
    relationName: "claim_attendee",
  }),
  processedClaims: many(freebieClaims, {
    relationName: "claim_operator",
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const eventsRelations = relations(events, ({ many, one }) => ({
  owner: one(users, {
    fields: [events.ownerId],
    references: [users.id],
  }),
  attendances: many(attendances),
  freebieItems: many(freebieItems),
}))

export const attendancesRelations = relations(attendances, ({ one }) => ({
  event: one(events, {
    fields: [attendances.eventId],
    references: [events.id],
  }),
  attendee: one(users, {
    fields: [attendances.attendeeId],
    references: [users.id],
    relationName: "attendance_attendee",
  }),
  scanner: one(users, {
    fields: [attendances.scannedById],
    references: [users.id],
    relationName: "attendance_scanner",
  }),
}))

export const freebieItemsRelations = relations(
  freebieItems,
  ({ many, one }) => ({
    event: one(events, {
      fields: [freebieItems.eventId],
      references: [events.id],
    }),
    claims: many(freebieClaims),
  })
)

export const freebieClaimsRelations = relations(freebieClaims, ({ one }) => ({
  event: one(events, {
    fields: [freebieClaims.eventId],
    references: [events.id],
  }),
  item: one(freebieItems, {
    fields: [freebieClaims.itemId],
    references: [freebieItems.id],
  }),
  attendee: one(users, {
    fields: [freebieClaims.attendeeId],
    references: [users.id],
    relationName: "claim_attendee",
  }),
  operator: one(users, {
    fields: [freebieClaims.claimedById],
    references: [users.id],
    relationName: "claim_operator",
  }),
}))

export type Profession = (typeof professionEnum.enumValues)[number]
export type EventStatus = (typeof eventStatusEnum.enumValues)[number]
export type AttendanceStatus = (typeof attendanceStatusEnum.enumValues)[number]

export const publicAttendeeView = sql`
  ${users.publicId},
  ${users.name},
  ${users.prcNumber},
  ${users.profession},
  ${users.organization},
  ${users.city},
  ${users.image}
`
