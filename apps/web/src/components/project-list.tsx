"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Shape } from "./verify-badge";
import { timeAgo } from "@/lib/data";
import type { ProjectRow } from "@/app/dashboard/page";

export function ProjectList({ initial }: { initial: ProjectRow[] }) {
  const [list, setList] = useState(initial);
  const [ask, setAsk] = useState<string | null>(null);

  if (!list.length)
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
        <h3 className="text-lg font-semibold">No projects yet</h3>
        <p className="mx-auto mt-2 max-w-md text-graphite">Start from a template or a blank screen. It saves to your account as you work.</p>
        <a href="/editor?new=1" className="btn btn-primary mt-6">New project</a>
      </div>
    );

  return (
    <ul className="mt-6 divide-y divide-line border-y border-line">
      {list.map(p => (
        <li key={p.id} className="flex items-center gap-4 py-3.5">
          <Shape w={p.w} h={p.h} round={false} />
          <a href={`/editor?open=${p.id}`} className="min-w-0 flex-1 hover:text-signal">
            <span className="block truncate font-medium">{p.name}</span>
            <span className="block truncate text-sm text-mist">
              {p.board_label || "Custom size"}, {p.w} × {p.h}, {p.screens} {p.screens === 1 ? "screen" : "screens"}
            </span>
          </a>
          {p.post_id && (
            <Link href={`/community/${p.post_id}`} className="hidden rounded-full bg-[#E7F7EE] px-2.5 py-0.5 text-xs font-medium text-[#147A43] sm:inline">
              Published
            </Link>
          )}
          <span className="hidden w-28 text-right text-sm text-mist sm:block">{timeAgo(p.updated_at)}</span>
          {ask === p.id ? (
            <span className="flex gap-2">
              <button
                className="btn btn-sm bg-danger text-white"
                onClick={async () => {
                  const r = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
                  if (r.ok) setList(l => l.filter(x => x.id !== p.id));
                  setAsk(null);
                }}
              >
                Delete
              </button>
              <button className="btn btn-quiet btn-sm" onClick={() => setAsk(null)}>Keep</button>
            </span>
          ) : (
            <button className="grid size-9 place-items-center rounded-lg text-mist hover:bg-card hover:text-danger" onClick={() => setAsk(p.id)} aria-label={`Delete ${p.name}`}>
              <Trash2 size={16} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
