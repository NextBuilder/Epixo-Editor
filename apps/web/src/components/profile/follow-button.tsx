"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({ handle, following, followers = 0, signedIn, small = false }: { handle: string; following: boolean; followers?: number; signedIn: boolean; small?: boolean }) {
  const [s, setS] = useState({ following, followers });
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      className={`btn ${small ? "btn-sm" : ""} ${s.following ? "btn-quiet" : "btn-ink"} min-w-[92px]`}
      aria-pressed={s.following}
      disabled={busy}
      onClick={async () => {
        if (!signedIn) return router.push(`/login?next=/u/${handle}`);
        setBusy(true);
        setS(x => ({ following: !x.following, followers: x.followers + (x.following ? -1 : 1) }));
        const r = await fetch(`/api/users/${handle}/follow`, { method: "POST" });
        const j = (await r.json().catch(() => null)) as { following: boolean; followers: number } | null;
        if (r.ok && j) setS(j);
        else setS({ following, followers });
        setBusy(false);
        router.refresh();
      }}
    >
      <span key={String(s.following)} className="scale-in inline-flex">{s.following ? "Following" : "Follow"}</span>
    </button>
  );
}
