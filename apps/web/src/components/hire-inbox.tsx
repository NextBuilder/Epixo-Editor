"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, Building2, Check, Clock, Reply, Wallet } from "lucide-react";
import { Avatar } from "./site-header";
import { timeAgo } from "@/lib/data";

export type HireReq = { id: string; name: string; email: string; company: string; kind: string; budget: string; timeline: string; message: string; status: string; created_at: number; handle: string; avatar: string | null };

export function HireInbox({ initial, hireOpen }: { initial: HireReq[]; hireOpen: boolean }) {
  const [list, setList] = useState(initial);
  const [leaving, setLeaving] = useState<string | null>(null);
  const setStatus = async (id: string, status: string) => {
    if (status === "archived") {
      setLeaving(id);
      setTimeout(() => setList(l => l.filter(x => x.id !== id)), 420);
    } else setList(l => l.map(x => (x.id === id ? { ...x, status } : x)));
    await fetch(`/api/hire/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
  };

  if (!list.length)
    return (
      <div className="mt-6 rounded-[22px] border border-dashed border-line-strong px-6 py-12 text-center">
        <h3 className="text-lg font-semibold">No requests yet</h3>
        <p className="mx-auto mt-2 max-w-md text-graphite">
          {hireOpen ? "When someone sends you a request from your profile, it lands here." : "Turn on Available for work so people can send you requests."}
        </p>
        {!hireOpen && <Link href="/settings#hire" className="btn btn-primary mt-6">Turn on hiring</Link>}
      </div>
    );

  return (
    <ul className="mt-6">
      {list.map((r, i) => {
        const unread = r.status === "new";
        const mail = `mailto:${r.email}?subject=${encodeURIComponent(`Re: your ${r.kind ? r.kind.toLowerCase() : "request"} on Epixo`)}&body=${encodeURIComponent(`Hi ${r.name.split(" ")[0]},\n\n`)}`;
        return (
          <li key={r.id} data-reveal style={{ "--i": i % 4 } as React.CSSProperties} className={`grid transition-[grid-template-rows,opacity,margin,transform] duration-[420ms] [transition-timing-function:var(--ease-ios)] ${leaving === r.id ? "mb-0 grid-rows-[0fr] scale-95 opacity-0" : "mb-4 grid-rows-[1fr]"}`}>
          <div className="min-h-0 overflow-hidden">
          <div className={`rounded-[22px] bg-card p-5 transition-shadow duration-500 sm:p-6 ${unread ? "shadow-[inset_0_0_0_1.5px_var(--color-signal)]" : "shadow-[inset_0_0_0_1px_var(--color-line)]"}`}>
            <div className="flex flex-wrap items-start gap-4">
              <Avatar src={r.avatar} name={r.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{r.name}</span>
                  {unread && <span className="scale-in rounded-full bg-signal px-2 py-0.5 text-[11px] font-semibold text-white">New</span>}
                  {r.status === "replied" && <span className="scale-in flex items-center gap-1 rounded-full bg-[#E7F7EE] px-2 py-0.5 text-[11px] font-semibold text-[#137A41]"><Check size={11} />Replied</span>}
                </p>
                <p className="mt-0.5 text-sm text-mist">
                  <Link href={`/u/${r.handle}`} className="hover:text-ink">@{r.handle}</Link>, {timeAgo(r.created_at)}
                </p>
              </div>
              {r.kind && <span className="rounded-full bg-paper px-3 py-1 text-[13px] font-medium shadow-[inset_0_0_0_1px_var(--color-line)]">{r.kind}</span>}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-graphite">
              {r.company && <span className="flex items-center gap-1.5"><Building2 size={15} />{r.company}</span>}
              {r.budget && <span className="flex items-center gap-1.5"><Wallet size={15} />{r.budget}</span>}
              {r.timeline && <span className="flex items-center gap-1.5"><Clock size={15} />{r.timeline}</span>}
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{r.message}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <a href={mail} className="btn btn-primary btn-sm" onClick={() => setStatus(r.id, "replied")}><Reply size={15} />Reply by email</a>
              <span className="mr-auto truncate text-sm text-mist">{r.email}</span>
              {unread && <button className="btn btn-quiet btn-sm" onClick={() => setStatus(r.id, "read")}>Mark as read</button>}
              <button className="btn btn-sm text-graphite hover:text-ink" onClick={() => setStatus(r.id, "archived")}><Archive size={15} />Archive</button>
            </div>
          </div>
          </div>
          </li>
        );
      })}
    </ul>
  );
}
