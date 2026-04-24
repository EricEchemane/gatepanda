"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"

type UseQrScannerOptions = {
  elementId: string
  enabled: boolean
  onScan: (value: string) => void
}

export function useQrScanner({
  elementId,
  enabled,
  onScan,
}: UseQrScannerOptions) {
  const [status, setStatus] = useState<
    "idle" | "starting" | "ready" | "resolved" | "error"
  >("idle")
  const [error, setError] = useState<string | null>(null)
  const resolvedRef = useRef(false)

  const handleScan = useEffectEvent((value: string) => {
    if (resolvedRef.current) {
      return
    }

    resolvedRef.current = true
    setStatus("resolved")
    onScan(value)
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    let active = true
    type ScannerType = {
      stop: () => Promise<void>
      clear: () => void | Promise<void>
    }

    let scanner: ScannerType | null = null

    async function startScanner() {
      try {
        setStatus("starting")
        setError(null)

        const { Html5Qrcode } = await import("html5-qrcode")

        if (!active) {
          return
        }

        const instance = new Html5Qrcode(elementId)
        scanner = instance

        await instance.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          (decodedText) => {
            handleScan(decodedText)
          },
          undefined
        )

        if (active) {
          setStatus("ready")
        }
      } catch (caughtError) {
        if (!active) {
          return
        }

        setStatus("error")
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to start camera scanning."
        )
      }
    }

    startScanner()

    return () => {
      active = false

      if (scanner) {
        void scanner
          .stop()
          .catch(() => null)
          .then(() => Promise.resolve(scanner?.clear()).catch(() => null))
      }
    }
  }, [elementId, enabled])

  return {
    status,
    error,
  }
}
