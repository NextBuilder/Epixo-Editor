"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Plus, Trash2, ExternalLink, Copy } from "lucide-react";
import { Device, deviceWidth } from "./device";
import { renderStill } from "@/lib/lvgl";
import { timeAgo } from "@/lib/data";

type Proj = { name: string; pid?: string; cur?: string; board?: { round?: boolean }; screens: { id: string }[] };
export type ProjectRow = { id: string; name: string; board_label: string | null; w: number; h: number; screens: number; updated_at: number; post_id: string | null };

// Draws the project's first screen with LVGL once the card scrolls into view.
function Thumb({ p }: { p: ProjectRow }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [round, setRound] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const el = cv.current!;
    let dead = false;
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      try {
        const proj = (await (await fetch(`/api/projects/${p.id}`, { cache: "no-store" })).json()) as Proj;
        if (dead) return;
        setRound(!!proj.board?.round);
        const s = Math.max(0, proj.screens.findIndex((x: { id: string }) => x.id === proj.cur));
        await renderStill(el, proj, s);
        if (!dead) setDone(true);
      } catch {}
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => { dead = true; io.disconnect(); };
  }, [p.id, p.updated_at]);
  return (
    <Device w={p.w} h={p.h} round={round} width={deviceWidth(p.w, p.h, round)}>
      {!done && <span className="shimmer-dark absolute inset-0" aria-hidden />}
      <canvas ref={cv} width={p.w} height={p.h} className={`block size-full transition-opacity duration-500 ${done ? "opacity-100" : "opacity-0"}`} aria-hidden />
    </Device>
  );
}

export function ProjectGrid({ initial }: { initial: ProjectRow[] }) {
  const [list, setList] = useState(initial);
  const [menu, setMenu] = useState<string | null>(null);
  const [ask, setAsk] = useState<string | null>(null);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    addEventListener("pointerdown", close);
    return () => removeEventListener("pointerdown", close);
  }, [menu]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      <a href="/editor?new=1" className="press stage flex aspect-[4/3] flex-col items-center justify-center gap-3 text-graphite transition-colors hover:text-signal">
        <span className="grid size-14 place-items-center rounded-full bg-card shadow-[var(--shadow-card)]"><Plus size={26} strokeWidth={2} /></span>
        <span className="text-[15px] font-medium">New project</span>
      </a>
      {list.map(p => (
        <div key={p.id} className="group relative">
          <a href={`/editor?open=${p.id}`} className="press stage hover-device flex aspect-[4/3] items-center justify-center overflow-hidden" aria-label={`Open ${p.name}`}>
            <Thumb p={p} />
          </a>
          <div className="mt-3 flex items-start gap-2 px-1">
            <a href={`/editor?open=${p.id}`} className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold tracking-[-0.01em] hover:text-signal">{p.name}</p>
              <p className="truncate text-[13px] text-mist">{timeAgo(p.updated_at)} · {p.board_label || `${p.w} × ${p.h}`}</p>
            </a>
            {p.post_id && <Link href={`/community/${p.post_id}`} className="tag tag-live mt-0.5">Published</Link>}
            <div className="relative" onPointerDown={e => e.stopPropagation()}>
              <button className="btn-icon grid place-items-center" onClick={() => { setMenu(m => (m === p.id ? null : p.id)); setAsk(null); }} aria-label={`More for ${p.name}`} aria-expanded={menu === p.id}>
                <MoreHorizontal size={18} />
              </button>
              {menu === p.id && (
                <div className="scale-in absolute bottom-10 right-0 z-20 w-56 origin-bottom-right rounded-2xl bg-raised p-1.5 shadow-[var(--shadow-float)]" role="menu">
                  <a href={`/editor?open=${p.id}`} className="flex h-10 items-center gap-3 rounded-xl px-2.5 text-[15px] hover:bg-fill" role="menuitem"><ExternalLink size={16} className="text-graphite" />Open</a>
                  <button className="flex h-10 w-full items-center gap-3 rounded-xl px-2.5 text-[15px] hover:bg-fill" role="menuitem" onClick={async () => {
                    const proj = (await (await fetch(`/api/projects/${p.id}`)).json()) as Proj;
                    const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), x => "abcdefghijkmnpqrstuvwxyz23456789"[x % 32]).join("");
                    proj.name = `${proj.name} copy`.slice(0, 80);
                    proj.pid = id;
                    const r = await fetch(`/api/projects/${id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(proj) });
                    if (r.ok) setList(l => [{ ...p, id, name: proj.name, post_id: null, updated_at: Math.floor(Date.now() / 1000) }, ...l]);
                    setMenu(null);
                  }}><Copy size={16} className="text-graphite" />Duplicate</button>
                  <div className="divider mx-2.5 my-1" />
                  {ask === p.id ? (
                    <button className="flex h-10 w-full items-center gap-3 rounded-xl bg-danger-soft px-2.5 text-[15px] font-medium text-danger" role="menuitem" onClick={async () => {
                      const r = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
                      if (r.ok) setList(l => l.filter(x => x.id !== p.id));
                      setMenu(null);
                    }}><Trash2 size={16} />Delete for good</button>
                  ) : (
                    <button className="flex h-10 w-full items-center gap-3 rounded-xl px-2.5 text-[15px] text-danger hover:bg-fill" role="menuitem" onClick={() => setAsk(p.id)}><Trash2 size={16} />Delete</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
