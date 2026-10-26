"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "@/components/icons";
import { Avatar } from "./avatar";
import { timeAgo } from "@/lib/data";

type C = { id: string; body: string; created_at: number; handle: string; name: string; avatar: string | null; user_id: string };

export function Comments({ postId, me, ownerId, admin }: { postId: string; me: { id: string; name: string; avatar: string | null } | null; ownerId: string; admin: boolean }) {
  const [list, setList] = useState<C[] | null>(null);
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then(r => r.json() as Promise<{ comments: C[] }>)
      .then(j => setList(j.comments ?? []))
      .catch(() => setList([]));
  }, [postId]);
  useEffect(() => {
    const t = box.current;
    if (t) { t.style.height = "auto"; t.style.height = Math.min(160, t.scrollHeight) + "px"; }
  }, [body]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || body.trim().length < 2) return;
    setErr("");
    setBusy(true);
    const r = await fetch(`/api/posts/${postId}/comments`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
    const j = (await r.json().catch(() => ({}))) as { comment?: C; error?: string };
    setBusy(false);
    if (!r.ok || !j.comment) return setErr(j.error ?? "That did not send. Try again.");
    setList(l => [...(l ?? []), j.comment!]);
    setBody("");
  }

  async function remove(id: string) {
    const r = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (r.ok) setList(l => (l ?? []).filter(c => c.id !== id));
  }

  return (
    <section className="mt-14" aria-labelledby="comments-h">
      <h2 id="comments-h" className="text-[22px]">
        Comments {list && list.length > 0 && <span className="text-mist">{list.length}</span>}
      </h2>
      <ul className="mt-6 space-y-5">
        {list === null && [0, 1].map(k => <li key={k} className="flex gap-3"><span className="shimmer size-8 shrink-0 rounded-full" /><span className="flex-1 space-y-2 pt-1"><span className="shimmer block h-3 w-32 rounded" /><span className="shimmer block h-3 w-3/4 rounded" /></span></li>)}
        {list?.length === 0 && <li className="text-[15px] text-mist">No comments yet. Start the conversation.</li>}
        {list?.map(c => (
          <li key={c.id} className="rise group flex gap-3">
            <Link href={`/u/${c.handle}`} className="shrink-0"><Avatar src={c.avatar} name={c.name} size={32} /></Link>
            <div className="min-w-0 flex-1">
              <div className="inline-block max-w-full rounded-[18px] rounded-tl-md bg-card px-4 py-2.5 shadow-[var(--shadow-card)]">
                <p className="text-[13px]">
                  <Link href={`/u/${c.handle}`} className="font-semibold hover:text-signal">{c.name}</Link>
                  {c.user_id === ownerId && <span className="tag tag-signal ml-2 h-5 px-2 text-[11px]">Maker</span>}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px]">{c.body}</p>
              </div>
              <p className="mt-1 flex gap-3 px-2 text-[12px] text-mist">
                {timeAgo(c.created_at)}
                {me && (me.id === c.user_id || me.id === ownerId || admin) && (
                  <button className="opacity-0 transition-opacity hover:text-danger focus:opacity-100 group-hover:opacity-100" onClick={() => remove(c.id)}>Delete</button>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {me ? (
        <form onSubmit={send} className="mt-8 flex items-end gap-3">
          <Avatar src={me.avatar} name={me.name} size={32} />
          <div className="flex flex-1 items-end gap-2 rounded-[22px] bg-card py-1.5 pl-4 pr-1.5 shadow-[var(--shadow-card)] focus-within:shadow-[0_0_0_1px_var(--color-signal),0_0_0_4px_var(--color-signal-soft)]">
            <textarea ref={box} rows={1} className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[15px] outline-none placeholder:text-mist" value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Add a comment" maxLength={1000} aria-label="Add a comment" />
            <button className="grid size-8 shrink-0 place-items-center rounded-full bg-signal text-white transition-[opacity,transform] duration-300 disabled:scale-90 disabled:opacity-30" disabled={busy || body.trim().length < 2} aria-label="Send">
              <ArrowUp size={17} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-8 text-[15px] text-graphite">
          <Link href={`/login?next=/community/${postId}`} className="text-signal hover:underline">Sign in</Link> to comment.
        </p>
      )}
      {err && <p className="mt-2 pl-11 text-[13px] text-danger">{err}</p>}
    </section>
  );
}
