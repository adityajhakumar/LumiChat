"use client"

import { useEffect } from "react"

export default function CleanupScript() {
  useEffect(() => {
    // Only run cleanup once per session
    const hasRunCleanup = sessionStorage.getItem("cache_cleanup_done")
    
    if (hasRunCleanup) {
      return
    }

    console.log("[CleanupScript] Starting cache cleanup...")

    // Remove ALL service workers
    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        console.log(`[CleanupScript] Found ${regs.length} service workers`)
        regs.forEach((reg) => {
          reg.unregister()
          console.log("[CleanupScript] Unregistered service worker")
        })
      }).catch((err) => {
        console.error("[CleanupScript] Error unregistering service workers:", err)
      })
    }

    // Clear browser caches (RSC, JS chunks, static assets)
    if (typeof window !== "undefined" && window.caches) {
      caches.keys().then((keys) => {
        console.log(`[CleanupScript] Found ${keys.length} cache keys`)
        keys.forEach((key) => {
          caches.delete(key)
          console.log(`[CleanupScript] Deleted cache: ${key}`)
        })
      }).catch((err) => {
        console.error("[CleanupScript] Error clearing caches:", err)
      })
    }

    // Clear Next.js internal manifest caches
    try {
      localStorage.removeItem("__nextBuildManifest")
      localStorage.removeItem("__nextFontManifest")
      localStorage.removeItem("__next_data_caches")
      console.log("[CleanupScript] Cleared Next.js manifest caches")
    } catch (err) {
      console.error("[CleanupScript] Error clearing localStorage:", err)
    }

    // Mark cleanup as done for this session
    sessionStorage.setItem("cache_cleanup_done", "true")
    console.log("[CleanupScript] Cache cleanup completed!")
  }, [])

  return null
}
