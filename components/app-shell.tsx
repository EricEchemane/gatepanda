import Link from "next/link"

import { SignOutButton } from "@/components/sign-out-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppShellProps = {
  children: React.ReactNode
  title: string
  description: string
  user?: {
    name?: string | null
    email?: string | null
  } | null
  actions?: React.ReactNode
}

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/my-qr", label: "My QR" },
]

export function AppShell({
  children,
  title,
  description,
  user,
  actions,
}: AppShellProps) {
  return (
    <div className="min-h-svh bg-muted/30">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-xl border bg-background px-5 py-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium tracking-[0.18em] text-primary-foreground uppercase">
                  Gate Panda
                </div>
                <span className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  QR Attendance for Medical Events
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className={cn("px-4")}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </nav>
              <div className="flex flex-wrap items-center gap-3">
                {actions}
                {user ? (
                  <>
                    <div className="rounded-lg border bg-background px-4 py-2 text-sm">
                      <div className="font-medium">
                        {user.name ?? "Event Admin"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email ?? "Signed in"}
                      </div>
                    </div>
                    <SignOutButton />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  )
}
