import Link from "next/link"

import { SignOutButton } from "@/components/sign-out-button"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
        <header className="rounded-xl border bg-background">
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-4">
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
                {actions ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {actions}
                  </div>
                ) : null}
              </div>

              {user ? (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <div className="font-medium">
                    {user.name ?? "Event Admin"}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {user.email ?? "Signed in"}
                  </div>
                </div>
              ) : null}
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <nav className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="outline"
                    className={cn("w-full px-4 sm:w-auto")}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </nav>
              {user ? <SignOutButton /> : null}
            </div>
          </div>
        </header>

        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  )
}
