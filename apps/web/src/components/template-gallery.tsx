"use client";

import { useState } from "react";
import { TemplateStill } from "./template-still";
import { Shape } from "./verify-badge";
import type { Board } from "@/lib/data";

type T = { key: string; name: string; desc: string };

export function TemplateGallery({ templates, boards, all }: { templates: T[]; boards: Board[]; all: Board[] }) {
  const [id, setId] = useState(boards[0].id);
  const b = all.find(x => x.id === id) ?? boards[0];
  const lv = { id: b.id, name: b.name, brand: b.brand, w: b.w, h: b.h, round: b.round };
  const wide = b.w / b.h > 1.15;
  const portrait = b.h / b.w > 1.15;

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-2" role="group" aria-label="Preview on board">
        <span className="mr-2 text-sm text-graphite">Preview on</span>
        {boards.map(x => (
          <button key={x.id} onClick={() => setId(x.id)} aria-pressed={x.id === id} className={`pill flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 text-sm ${x.id === id ? "bg-ink text-white [&_span_span]:border-white" : "bg-card text-graphite shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink"}`}>
            <Shape w={x.w} h={x.h} round={x.round} size={16} />
            {x.brand} {x.name.length > 22 ? x.size + " " + x.panel : x.name}
          </button>
        ))}
        <select className="field ml-auto !h-9 !w-auto max-w-[240px] text-sm" value={boards.some(x => x.id === id) ? "" : id} onChange={e => e.target.value && setId(e.target.value)} aria-label="Any board">
          <option value="">Any other board…</option>
          {all.map(x => (
            <option key={x.id} value={x.id}>
              {x.brand} {x.name}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-3 text-sm text-mist">
        {b.brand} {b.name}, {b.w} × {b.h}
        {b.round ? ", round" : ""}
      </p>

      <div className={`mt-10 grid gap-x-8 gap-y-14 ${wide ? "sm:grid-cols-2" : portrait ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"}`}>
        {templates.map((t, ti) => (
          <article key={t.key + id} data-reveal style={{ "--i": ti % 3 } as React.CSSProperties} className="group">
            <div className="hover-device flex items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#EDEFF3,#E6E9EE)] p-6 sm:p-8">
              <TemplateStill board={lv} template={t.key} width={b.round ? "80%" : wide ? "100%" : portrait ? "78%" : "88%"} />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4 px-1">
              <div>
                <h2 className="font-sans text-[17px] font-semibold tracking-normal">{t.name}</h2>
                <p className="mt-1 text-sm text-graphite">{t.desc}</p>
              </div>
              <a href={`/editor?template=${t.key}&board=${b.id}`} className="btn btn-quiet btn-sm shrink-0">Use template</a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
