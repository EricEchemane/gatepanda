export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  nextAuthUrl: process.env.NEXTAUTH_URL ?? "",
  nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "",
  googleClientId:
    process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret:
    process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000",
}

export const hasDatabase = Boolean(env.databaseUrl)
export const hasGoogleAuth = Boolean(
  env.googleClientId && env.googleClientSecret
)
