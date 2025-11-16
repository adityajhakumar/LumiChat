"use client"

import { AuthProvider } from "@/contexts/auth-context"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything during SSR to prevent hydration mismatches
  if (!isClient) {
    return null
  }

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
