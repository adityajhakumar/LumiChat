"use client"

import { AuthProvider } from "@/contexts/auth-context"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render children until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#212121] text-[#E5E5E0]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC785C]"></div>
          <div>Initializing...</div>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
