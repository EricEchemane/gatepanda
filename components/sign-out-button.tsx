"use client"

import { useTransition } from "react"
import { signOut } from "next-auth/react"

import { LoadingButton } from "@/components/loading-button"

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <LoadingButton
      variant="outline"
      loading={isPending}
      loadingText="Signing out..."
      onClick={() =>
        startTransition(() => {
          void signOut({ callbackUrl: "/" })
        })
      }
    >
      Sign out
    </LoadingButton>
  )
}
