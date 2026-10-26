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
      <div className="-mx-5 mt-8 flex items-center gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Preview on board">
        {boards.map(x => (
          <button key={x.id} onClick={() => setId(x.id)} aria-pressed={x.id === id} data-on={x.id === id} className="chip pl-2.5 [&[data-on=true]_span_span]:border-paper">
            <Shape w={x.w} h={x.h} round={x.round} size={16} />
            {x.brand} {x.size}{x.round ? " round" : ""}
          </button>
        ))}
        <select className="field !h-8 !w-auto max-w-[220px] rounded-full !px-3.5 text-[14px] sm:ml-auto" value={boards.some(x => x.id === id) ? "" : id} onChange={e => e.target.value && setId(e.target.value)} aria-label="Any board">
          <option value="">Any other board…</option>
          {all.map(x => (
            <option key={x.id} value={x.id}>
              {x.brand} {x.name}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-3 text-[13px] text-mist">
        {b.brand} {b.name}, {b.w} × {b.h}
        {b.round ? ", round" : ""}
      </p>

      <div className={`mt-10 grid gap-x-8 gap-y-14 ${wide ? "sm:grid-cols-2" : portrait ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"}`}>
        {templates.map((t, ti) => (
          <article key={t.key + id} data-reveal style={{ "--i": ti % 3 } as React.CSSProperties} className="group">
            <div className="stage hover-device flex items-center justify-center p-6 sm:p-9">
              <TemplateStill board={lv} template={t.key} width={b.round ? "80%" : wide ? "100%" : portrait ? "78%" : "88%"} />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4 px-1">
              <div>
                <h2 className="font-sans text-[17px] font-semibold tracking-[-0.015em]">{t.name}</h2>
                <p className="mt-0.5 text-[14px] text-mist">{t.desc}</p>
              </div>
              <a href={`/editor?template=${t.key}&board=${b.id}`} className="btn btn-quiet btn-sm shrink-0">Use</a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
