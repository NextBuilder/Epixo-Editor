"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "@/components/icons";
import { Shape, VerifyBadge } from "./verify-badge";
import type { Board } from "@/lib/data";

type Brand = { name: string; slug: string; count: number };
const FILTERS = [
  ["all", "All"],
  ["round", "Round"],
  ["touch", "Touch"],
  ["pack", "Ready to build"],
  ["checked", "Verified"],
] as const;

export function BoardDirectory({ boards, brands }: { boards: Board[]; brands: Brand[] }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("all");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return boards.filter(b => {
      if (f === "round" && !b.round) return false;
      if (f === "touch" && !b.touch) return false;
      if (f === "pack" && !b.pack) return false;
      if (f === "checked" && b.v !== "driver" && b.v !== "cyd") return false;
      if (!s) return true;
      return `${b.brand} ${b.name} ${b.chip} ${b.lcd} ${b.tp} ${b.w}x${b.h} ${b.size} ${b.panel}`.toLowerCase().includes(s);
    });
  }, [boards, q, f]);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav className="sticky top-24 space-y-0.5" aria-label="Makers">
          {brands.map(b => {
            const n = shown.filter(x => x.brand === b.name).length;
            return (
              <a key={b.slug} href={`#${b.slug}`} className={`flex justify-between rounded-lg px-3 py-1.5 text-[14px] hover:bg-fill ${n ? "text-graphite hover:text-ink" : "pointer-events-none text-mist/50"}`}>
                <span>{b.name}</span>
                <span className="tabular-nums text-mist">{n}</span>
              </a>
            );
          })}
        </nav>
      </aside>
      <div>
        <label className="search">
          <Search size={16} />
          <input placeholder="Name, chip or size like 800x480" value={q} onChange={e => setQ(e.target.value)} aria-label="Search boards" />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filter boards">
          {FILTERS.map(([k, label]) => (
            <button key={k} onClick={() => setF(k)} aria-pressed={f === k} data-on={f === k} className="chip">{label}</button>
          ))}
          <span className="ml-auto text-[13px] tabular-nums text-mist">{shown.length} boards</span>
        </div>

        {brands.map(br => {
          const list = shown.filter(b => b.brand === br.name);
          if (!list.length) return null;
          return (
            <section key={br.slug} id={br.slug} className="scroll-mt-20 pt-10">
              <h2 className="group-title font-sans text-[15px] font-semibold tracking-normal text-ink">{br.name}</h2>
              <ul className="inset-group">
                {list.map(b => (
                  <li key={b.id}>
                    <Link href={`/boards/${b.id}`} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors duration-200 hover:bg-fill sm:grid-cols-[28px_minmax(0,1.6fr)_100px_minmax(0,1fr)_auto]">
                      <Shape w={b.w} h={b.h} round={b.round} />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-medium">{b.name}</span>
                        <span className="block truncate text-[13px] text-mist sm:hidden">
                          {b.w} × {b.h}, {b.size} {b.panel}
                        </span>
                      </span>
                      <span className="hidden text-[14px] tabular-nums text-graphite sm:block">
                        {b.w} × {b.h}
                      </span>
                      <span className="hidden truncate text-[14px] text-mist sm:block">
                        {b.size} {b.panel}, {b.chip}
                      </span>
                      <VerifyBadge v={b.v} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {!shown.length && (
          <div className="stage mt-10 px-6 py-16 text-center">
            <h2 className="text-[22px]">No matches</h2>
            <p className="mt-2 text-[15px] text-graphite">Try a size like 480x480, or use Custom size in the editor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
