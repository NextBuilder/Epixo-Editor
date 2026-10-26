"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "./icons";
import { BrandTile } from "./brand";
import { PLATFORMS, type SocialKey } from "@/lib/profile";

type Links = Partial<Record<SocialKey, string>>;
const GROUPS = ["Social", "Video and chat", "Code and making", "Writing and design", "Support"] as const;

// Social links as an iOS list: added links show as rows you can edit or remove, and Add Link opens a picker of platforms.
export function SocialEditor({ value, onChange }: { value: Links; onChange: (v: Links) => void }) {
  const [order, setOrder] = useState<SocialKey[]>(() => PLATFORMS.map(p => p.key).filter(k => value[k]));
  const [picking, setPicking] = useState(false);
  const [focus, setFocus] = useState<SocialKey | null>(null);
  const inputs = useRef<Partial<Record<SocialKey, HTMLInputElement | null>>>({});
  useEffect(() => { if (focus) { inputs.current[focus]?.focus(); setFocus(null); } }, [focus, order]);
  useEffect(() => {
    if (!picking) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setPicking(false);
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [picking]);

  const add = (k: SocialKey) => {
    setPicking(false);
    if (!order.includes(k)) { setOrder(o => [...o, k]); onChange({ ...value, [k]: value[k] ?? "" }); }
    setFocus(k);
  };
  const remove = (k: SocialKey) => {
    setOrder(o => o.filter(x => x !== k));
    onChange({ ...value, [k]: "" });
  };

  return (
    <section id="links" className="scroll-mt-24">
      <h3 className="group-title font-sans tracking-normal">Social links</h3>
      <div className="inset-group">
        {order.map(k => {
          const p = PLATFORMS.find(x => x.key === k)!;
          return (
            <div key={k} className="rise flex min-h-[52px] items-center gap-3 px-4">
              <button type="button" onClick={() => remove(k)} className="grid size-[22px] shrink-0 place-items-center rounded-full bg-danger text-white transition-transform active:scale-90" aria-label={`Remove ${p.label}`}>
                <span className="block h-[2px] w-[10px] rounded-full bg-white" />
              </button>
              <BrandTile k={k} size={29} />
              <label htmlFor={`link-${k}`} className="w-[96px] shrink-0 truncate text-[16px]">{p.label}</label>
              <input id={`link-${k}`} ref={el => { inputs.current[k] = el; }} className="row-input" value={value[k] ?? ""} placeholder={p.hint} maxLength={200} autoComplete="off" autoCapitalize="off" spellCheck={false} onChange={e => onChange({ ...value, [k]: e.target.value })} />
            </div>
          );
        })}
        <button type="button" onClick={() => setPicking(true)} className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-[16px] text-signal transition-colors hover:bg-fill">
          <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-live text-white"><Plus size={14} weight="bold" /></span>
          Add link
        </button>
      </div>
      <p className="group-note">Type a username or paste a link. Links show on your profile in this order.</p>

      {picking && (
        <div className="scrim-in fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={e => e.target === e.currentTarget && setPicking(false)} role="dialog" aria-modal aria-labelledby="pick-title">
          <div className="sheet-in max-h-[86dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-paper shadow-[var(--shadow-float)] sm:rounded-[28px]">
            <div className="glass sticky top-0 z-10 flex items-center justify-between px-5 py-4 shadow-[inset_0_-0.5px_0_var(--color-line-strong)]">
              <span className="w-8" />
              <h2 id="pick-title" className="font-sans text-[17px] font-semibold tracking-[-0.02em]">Add link</h2>
              <button type="button" className="grid size-8 place-items-center rounded-full bg-fill text-graphite" onClick={() => setPicking(false)} aria-label="Close"><X size={15} weight="bold" /></button>
            </div>
            <div className="space-y-7 px-5 pb-8 pt-5">
              {GROUPS.map(g => (
                <section key={g}>
                  <h3 className="group-title px-1 font-sans tracking-normal">{g}</h3>
                  <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-5">
                    {PLATFORMS.filter(p => p.group === g).map(p => {
                      const has = order.includes(p.key);
                      return (
                        <button key={p.key} type="button" onClick={() => add(p.key)} className="press flex flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center hover:bg-fill">
                          <span className="relative">
                            <BrandTile k={p.key} size={52} />
                            {has && <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-signal text-[11px] font-bold text-white ring-2 ring-paper">✓</span>}
                          </span>
                          <span className="line-clamp-2 text-[12px] leading-tight text-graphite">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
