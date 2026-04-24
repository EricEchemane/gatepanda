"use client"

import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

type GoogleSignInButtonProps = {
  configured: boolean
  callbackUrl?: string
}

export function GoogleSignInButton({
  configured,
  callbackUrl = "/",
}: GoogleSignInButtonProps) {
  return (
    <Button
      size="lg"
      disabled={!configured}
      onClick={() => void signIn("google", { callbackUrl })}
    >
      {configured ? "Continue with Google" : "Google auth needs setup"}
    </Button>
  )
}
