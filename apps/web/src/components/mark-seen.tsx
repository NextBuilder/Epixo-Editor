"use client";

import { useEffect } from "react";
import { loadMe } from "./use-me";

// Marks notifications as seen once they have been shown, so the bell dot clears.
export function MarkSeen({ any }: { any: boolean }) {
  useEffect(() => {
    if (any) fetch("/api/notifications", { method: "POST" }).then(() => loadMe(true)).catch(() => {});
  }, [any]);
  return null;
}
