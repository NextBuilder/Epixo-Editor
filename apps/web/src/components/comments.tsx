"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "./site-header";
import { timeAgo } from "@/lib/data";

type C = { id: string; body: string; created_at: number; handle: string; name: string; avatar: string | null; user_id: string };

export function Comments({ postId, me, ownerId, admin }: { postId: string; me: { id: string; name: string; avatar: string | null } | null; ownerId: string; admin: boolean }) {
  const [list, setList] = useState<C[] | null>(null);
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then(r => r.json() as Promise<{ comments: C[] }>)
      .then(j => setList(j.comments ?? []))
      .catch(() => setList([]));
  }, [postId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const r = await fetch(`/api/posts/${postId}/comments`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
    const j = (await r.json().catch(() => ({}))) as { comment?: C; error?: string };
    setBusy(false);
    if (!r.ok || !j.comment) return setErr(j.error ?? "Could not post that comment.");
    setList(l => [...(l ?? []), j.comment!]);
    setBody("");
  }

  async function remove(id: string) {
    const r = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (r.ok) setList(l => (l ?? []).filter(c => c.id !== id));
  }

  return (
    <section className="mt-16" aria-labelledby="comments-h">
      <h2 id="comments-h" className="text-xl font-semibold">
        Comments {list && list.length > 0 && <span className="font-normal text-mist">{list.length}</span>}
      </h2>
      {me ? (
        <form onSubmit={send} className="mt-5 flex gap-3">
          <Avatar src={me.avatar} name={me.name} size={36} />
          <div className="flex-1">
            <textarea className="field" rows={3} value={body} onChange={e => setBody(e.target.value)} placeholder="Ask a question or say what you like about it" maxLength={1000} />
            <div className="mt-2 flex items-center gap-3">
              <button className="btn btn-primary btn-sm" disabled={busy || body.trim().length < 2}>Post comment</button>
              {err && <span className="text-sm text-danger">{err}</span>}
            </div>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-graphite">
          <Link href={`/login?next=/community/${postId}`} className="font-medium text-signal hover:underline">Sign in</Link> to join the conversation.
        </p>
      )}
      <ul className="mt-8 space-y-6">
        {list === null && [0, 1].map(k => <li key={k} className="flex gap-3"><span className="shimmer size-9 shrink-0 rounded-full" /><span className="flex-1 space-y-2 pt-1"><span className="shimmer block h-3 w-32 rounded" /><span className="shimmer block h-3 w-3/4 rounded" /></span></li>)}
        {list?.length === 0 && <li className="text-sm text-mist">No comments yet.</li>}
        {list?.map(c => (
          <li key={c.id} className="scale-in flex gap-3" style={{ animationDuration: "0.5s" }}>
            <Avatar src={c.avatar} name={c.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <Link href={`/u/${c.handle}`} className="font-semibold hover:text-signal">{c.name}</Link>
                {c.user_id === ownerId && <span className="ml-2 rounded-full bg-signal-soft px-2 py-0.5 text-xs font-medium text-signal-deep">Maker</span>}
                <span className="ml-2 text-mist">{timeAgo(c.created_at)}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-[15px] text-ink">{c.body}</p>
              {me && (me.id === c.user_id || me.id === ownerId || admin) && (
                <button className="mt-1 text-xs text-mist hover:text-danger" onClick={() => remove(c.id)}>Delete</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
