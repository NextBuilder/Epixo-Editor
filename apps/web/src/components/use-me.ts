"use client";

import { useEffect, useState } from "react";

export type Me = { user: { id: string; handle: string; name: string; avatar: string | null; plan: string } | null; inbox?: number; unread?: number; ai: { enabled: boolean; credits?: number } };

let cache: Promise<Me> | null = null;

export function loadMe(fresh = false) {
  if (!cache || fresh) cache = fetch("/api/me", { cache: "no-store" }).then(r => r.json() as Promise<Me>).catch(() => ({ user: null, ai: { enabled: false } }));
  return cache;
}

export function useMe() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadMe().then(m => live && setMe(m));
    return () => {
      live = false;
    };
  }, []);
  return me;
}
