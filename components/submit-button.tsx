"use client"

import { LoaderCircle } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  pendingText?: string
}

export function SubmitButton({
  children,
  pendingText,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button disabled={disabled || pending} {...props}>
      {pending ? <LoaderCircle className="animate-spin" /> : null}
      {pending ? (pendingText ?? children) : children}
    </Button>
  )
}
