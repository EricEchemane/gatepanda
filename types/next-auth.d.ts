import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      publicId?: string | null
      prcNumber?: string | null
      profession?: string | null
      organization?: string | null
    }
  }
}
