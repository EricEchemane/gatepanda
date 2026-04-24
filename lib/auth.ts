import { DrizzleAdapter } from "@auth/drizzle-adapter"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { redirect } from "next/navigation"

import { accounts, sessions, users, verificationTokens } from "@/drizzle/schema"
import { db } from "@/lib/db"
import { env, hasGoogleAuth } from "@/lib/env"

export const authOptions: NextAuthOptions = {
  adapter: db
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
  session: {
    strategy: db ? "database" : "jwt",
  },
  providers: hasGoogleAuth
    ? [
        GoogleProvider({
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret,
        }),
      ]
    : [],
  callbacks: {
    async session({ session, user }) {
      const appUser = user as typeof user & {
        publicId?: string | null
        prcNumber?: string | null
        profession?: string | null
        organization?: string | null
      }

      if (session.user) {
        session.user.id = user.id
        session.user.publicId = appUser.publicId
        session.user.prcNumber = appUser.prcNumber
        session.user.profession = appUser.profession
        session.user.organization = appUser.organization
      }

      return session
    },
  },
  pages: {
    signIn: "/",
  },
  secret: env.nextAuthSecret || undefined,
}

export async function getCurrentSession() {
  return getServerSession(authOptions)
}

export async function requireUser() {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    redirect("/")
  }

  return session.user
}
