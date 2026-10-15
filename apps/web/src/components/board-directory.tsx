"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Shape, VerifyBadge } from "./verify-badge";
import type { Board } from "@/lib/data";

type Brand = { name: string; slug: string; count: number };
const FILTERS = [
  ["all", "All"],
  ["round", "Round"],
  ["touch", "Touch"],
  ["pack", "Ready-to-build pack"],
  ["checked", "Driver-verified"],
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
              <a key={b.slug} href={`#${b.slug}`} className={`flex justify-between rounded-lg px-3 py-1.5 text-[15px] hover:bg-card ${n ? "text-graphite hover:text-ink" : "pointer-events-none text-mist/60"}`}>
                <span>{b.name}</span>
                <span className="tabular-nums text-mist">{n}</span>
              </a>
            );
          })}
        </nav>
      </aside>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
            <input className="field pl-10" placeholder="Search by name, chip or resolution, like 800x480 or ST7701" value={q} onChange={e => setQ(e.target.value)} aria-label="Search boards" />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter boards">
          {FILTERS.map(([k, label]) => (
            <button key={k} onClick={() => setF(k)} aria-pressed={f === k} className={`pill rounded-full px-3.5 py-1.5 text-sm ${f === k ? "bg-ink text-white" : "bg-card text-graphite shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink"}`}>
              {label}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-mist">{shown.length} boards</span>
        </div>

        {brands.map(br => {
          const list = shown.filter(b => b.brand === br.name);
          if (!list.length) return null;
          return (
            <section key={br.slug} id={br.slug} data-reveal className="scroll-mt-24 pt-12">
              <h2 className="text-2xl font-semibold">{br.name}</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {list.map(b => (
                  <li key={b.id}>
                    <Link href={`/boards/${b.id}`} className="group grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3.5 transition-colors duration-300 hover:bg-card active:bg-line sm:grid-cols-[28px_minmax(0,1.6fr)_110px_minmax(0,1fr)_auto] sm:px-2">
                      <Shape w={b.w} h={b.h} round={b.round} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{b.name}</span>
                        <span className="block truncate text-sm text-mist sm:hidden">
                          {b.w} × {b.h}, {b.size} {b.panel}
                        </span>
                      </span>
                      <span className="hidden text-sm tabular-nums text-graphite sm:block">
                        {b.w} × {b.h}
                      </span>
                      <span className="hidden truncate text-sm text-graphite sm:block">
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
          <div className="mt-12 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
            <h2 className="text-xl font-semibold">No board matches that search</h2>
            <p className="mt-2 text-graphite">Try a resolution like 480x480, or pick Custom size in the editor to design for any screen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
