"use client";

import { useState } from "react";
import { Roll } from "./motion/motion";
import { useRouter } from "next/navigation";
import { Heart, Link2, Flag, Trash2, EyeOff, Eye, Check, Bookmark } from "@/components/icons";

async function call(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok) throw Object.assign(new Error(String(j.error ?? "Something went wrong")), { status: r.status });
  return j;
}

export function LikeButton({ id, likes, liked, signedIn }: { id: string; likes: number; liked: boolean; signedIn: boolean }) {
  const [s, setS] = useState({ likes, liked });
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(0);
  const router = useRouter();
  return (
    <button
      className={`btn btn-quiet flex-1 ${s.liked ? "text-heart" : ""}`}
      aria-pressed={s.liked}
      disabled={busy}
      onClick={async () => {
        if (!signedIn) return router.push(`/login?next=/community/${id}`);
        setBusy(true);
        if (!s.liked) setPop(n => n + 1);
        setS(x => ({ liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }));
        try {
          const j = await call(`/api/posts/${id}/like`, { method: "POST" });
          setS({ liked: !!j.liked, likes: Number(j.likes) });
        } catch {
          setS({ likes, liked });
        }
        setBusy(false);
      }}
    >
      <span className="relative grid place-items-center">
        <Heart key={pop} size={17} fill={s.liked ? "currentColor" : "none"} className={pop ? "heart-pop" : ""} />
        {pop > 0 && <span key={"b" + pop} className="burst" aria-hidden />}
      </span>
      <span className="overflow-hidden"><Roll value={s.likes} /></span>
    </button>
  );
}

export function SaveButton({ id, saved, signedIn }: { id: string; saved: boolean; signedIn: boolean }) {
  const [on, setOn] = useState(saved);
  const router = useRouter();
  return (
    <button
      className={`btn btn-quiet flex-1 ${on ? "text-signal" : ""}`}
      aria-pressed={on}
      onClick={async () => {
        if (!signedIn) return router.push(`/login?next=/community/${id}`);
        setOn(x => !x);
        try { const j = await call(`/api/posts/${id}/save`, { method: "POST" }); setOn(!!j.saved); } catch { setOn(saved); }
      }}
    >
      <Bookmark key={String(on)} size={17} fill={on ? "currentColor" : "none"} className={on ? "scale-in" : ""} />
      {on ? "Saved" : "Save"}
    </button>
  );
}

export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`btn btn-quiet ${className}`}
      onClick={async () => {
        const url = location.href;
        if (navigator.share && matchMedia("(pointer: coarse)").matches) {
          await navigator.share({ title, url }).catch(() => {});
          return;
        }
        await navigator.clipboard.writeText(url).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      <span key={String(done)} className="scale-in inline-flex">{done ? <Check size={17} className="text-live" /> : <Link2 size={17} />}</span>
      {done ? "Copied" : "Share"}
    </button>
  );
}

export function OwnerTools({ id, isOwner, isAdmin, hidden }: { id: string; isOwner: boolean; isAdmin: boolean; hidden: boolean }) {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);
  if (!isOwner && !isAdmin) return null;
  return (
    <div className="card mt-6 p-4">
      <p className="t-label">{isOwner ? "Your project" : "Moderation"}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {isAdmin && (
          <button
            className="btn btn-quiet btn-sm"
            onClick={async () => {
              try {
                await call(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify({ hidden: !hidden }) });
                router.refresh();
              } catch (e) {
                setErr((e as Error).message);
              }
            }}
          >
            {hidden ? <Eye size={15} /> : <EyeOff size={15} />}
            {hidden ? "Show in community" : "Hide from community"}
          </button>
        )}
        {confirm ? (
          <>
            <button
              className="btn btn-sm bg-danger text-white hover:opacity-90"
              onClick={async () => {
                try {
                  await call(`/api/posts/${id}`, { method: "DELETE" });
                  router.push("/community");
                  router.refresh();
                } catch (e) {
                  setErr((e as Error).message);
                }
              }}
            >
              Delete for good
            </button>
            <button className="btn btn-quiet btn-sm" onClick={() => setConfirm(false)}>Keep it</button>
          </>
        ) : (
          <button className="btn btn-quiet btn-sm text-danger" onClick={() => setConfirm(true)}>
            <Trash2 size={15} />
            Unpublish
          </button>
        )}
      </div>
      {confirm && <p className="mt-2 text-sm text-graphite">This removes the post, its images, likes and comments. The project stays in your dashboard.</p>}
      {err && <p className="mt-2 text-sm text-danger">{err}</p>}
    </div>
  );
}

export function ReportButton({ id, signedIn }: { id: string; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"" | "sent" | string>("");
  const router = useRouter();
  if (state === "sent") return <p className="text-sm text-graphite">Thanks. A moderator will look at it.</p>;
  if (!open)
    return (
      <button className="flex items-center gap-1.5 text-sm text-mist hover:text-ink" onClick={() => (signedIn ? setOpen(true) : router.push(`/login?next=/community/${id}`))}>
        <Flag size={14} />
        Report
      </button>
    );
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async e => {
        e.preventDefault();
        try {
          await call(`/api/posts/${id}/report`, { method: "POST", body: JSON.stringify({ reason }) });
          setState("sent");
        } catch (er) {
          setState((er as Error).message);
        }
      }}
    >
      <textarea className="field text-sm" rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="What is wrong with this project?" maxLength={500} autoFocus />
      <div className="flex gap-2">
        <button className="btn btn-quiet btn-sm">Send report</button>
        <button type="button" className="btn btn-sm text-graphite" onClick={() => setOpen(false)}>Cancel</button>
      </div>
      {state && <p className="text-sm text-danger">{state}</p>}
    </form>
  );
}
