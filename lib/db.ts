import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "@/drizzle/schema"
import { env, hasDatabase } from "@/lib/env"

const globalForDb = globalThis as typeof globalThis & {
  __gatePandaSql?: ReturnType<typeof postgres>
}

const sql = hasDatabase
  ? (globalForDb.__gatePandaSql ??
    postgres(env.databaseUrl, {
      prepare: false,
    }))
  : null

if (process.env.NODE_ENV !== "production" && sql) {
  globalForDb.__gatePandaSql = sql
}

export const db = sql
  ? drizzle(sql, {
      schema,
    })
  : null

export function assertDb() {
  if (!db) {
    throw new Error("DATABASE_URL is not configured.")
  }

  return db
}
