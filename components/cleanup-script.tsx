"use client";

import { useEffect } from "react";

export default function CleanupScript() {
  useEffect(() => {
    const done = sessionStorage.getItem("custom_cleanup_done");
    if (done) return;

    // Delete ONLY your own caches
    caches.keys().then(keys => {
      keys.forEach(key => {
        if (key.startsWith("myapp-")) {
          caches.delete(key);
        }
      });
    });

    sessionStorage.setItem("custom_cleanup_done", "true");
  }, []);

  return null;
}
