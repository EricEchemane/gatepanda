"use client"

import { useTransition } from "react"
import { signIn } from "next-auth/react"

import { LoadingButton } from "@/components/loading-button"

type GoogleSignInButtonProps = {
  configured: boolean
  callbackUrl?: string
  className?: string
}

export function GoogleSignInButton({
  configured,
  callbackUrl = "/",
  className,
}: GoogleSignInButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <LoadingButton
      className={className}
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
