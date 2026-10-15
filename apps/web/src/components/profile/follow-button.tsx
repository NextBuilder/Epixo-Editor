"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus } from "lucide-react";

export function FollowButton({ handle, following, followers, signedIn }: { handle: string; following: boolean; followers: number; signedIn: boolean }) {
  const [s, setS] = useState({ following, followers });
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      className={`btn ${s.following ? "btn-quiet" : "bg-ink text-white hover:bg-ink/90"}`}
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
      <span key={String(s.following)} className="scale-in inline-flex">{s.following ? <UserCheck size={17} /> : <UserPlus size={17} />}</span>
      {s.following ? "Following" : "Follow"}
    </button>
  );
}
