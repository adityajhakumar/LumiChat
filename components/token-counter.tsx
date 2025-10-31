"use client"

import { useEffect } from "react"

interface TokenCounterProps {
  count: number
}

export default function TokenCounter({ count }: TokenCounterProps) {
  // Save token count to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token_count", count.toString())
    }
  }, [count])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A]">
      <span className="text-xs font-medium text-[#9B9B95]">Tokens:</span>
      <span className="text-sm font-semibold text-[#E5E5E0]">{count.toLocaleString()}</span>
    </div>
  )
}
