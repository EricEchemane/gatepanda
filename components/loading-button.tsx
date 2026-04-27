"use client"

import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
  loadingText?: string
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? <LoaderCircle className="animate-spin" /> : null}
      {loading ? (loadingText ?? children) : children}
    </Button>
  )
}
