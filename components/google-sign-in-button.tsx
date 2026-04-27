"use client"

import { useTransition } from "react"
import { signIn } from "next-auth/react"

import { LoadingButton } from "@/components/loading-button"

type GoogleSignInButtonProps = {
  configured: boolean
  callbackUrl?: string
}

export function GoogleSignInButton({
  configured,
  callbackUrl = "/",
}: GoogleSignInButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <LoadingButton
      size="lg"
      loading={isPending}
      loadingText="Connecting to Google..."
      disabled={!configured}
      onClick={() =>
        startTransition(() => {
          void signIn("google", { callbackUrl })
        })
      }
    >
      {configured ? "Continue with Google" : "Google auth needs setup"}
    </LoadingButton>
  )
}
