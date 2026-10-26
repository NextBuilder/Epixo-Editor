"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, X } from "@/components/icons";
import { HIRE_TYPES } from "@/lib/profile";

type Props = { handle: string; name: string; types: string[]; signedIn: boolean; full?: boolean; label?: string };

export function HireButton({ handle, name, types, signedIn, full, label }: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const router = useRouter();
  useEffect(() => {
    if (location.hash === "#hire" && signedIn) setOpen(true);
  }, [signedIn]);
  return (
    <>
      <button
        className={`btn btn-primary ${full ? "w-full" : ""}`}
        onClick={() => (signedIn ? setOpen(true) : router.push(`/login?next=${encodeURIComponent(`/u/${handle}#hire`)}`))}
      >
        <Briefcase size={17} />
        {label ?? `Hire ${name.split(" ")[0]}`}
      </button>
      {open && <HireSheet handle={handle} name={name} types={types} onClose={close} />}
    </>
  );
}

function HireSheet({ handle, name, types, onClose: done }: { handle: string; name: string; types: string[]; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const onClose = useCallback(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    setClosing(true);
    setTimeout(done, 280);
  }, [done]);
  const first = name.split(" ")[0];
  const options = types.length ? types : [...HIRE_TYPES];
  const [f, setF] = useState({ name: "", email: "", company: "", kind: options[0] ?? "", budget: "", timeline: "", message: "" });
  const [state, setState] = useState<{ busy?: boolean; err?: string; done?: boolean }>({});
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    box.current?.querySelector("input")?.focus();
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-sm sm:items-center sm:p-6 ${closing ? "scrim-out" : "scrim-in"}`} onMouseDown={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal aria-labelledby="hire-title">
      <div ref={box} className={`${closing ? "sheet-out" : "sheet-in"} max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-paper shadow-[var(--shadow-float)] sm:rounded-[28px]`}>
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-line-strong sm:hidden" aria-hidden />
        <div className="glass sticky top-0 z-10 flex items-center justify-between px-6 py-4 shadow-[inset_0_-0.5px_0_var(--color-line-strong)]">
          <button className="text-[15px] text-signal" onClick={onClose}>Cancel</button>
          <h2 id="hire-title" className="font-sans text-[17px] font-semibold tracking-normal">Hire {first}</h2>
          <button className="grid size-8 place-items-center rounded-full bg-fill text-graphite" onClick={onClose} aria-label="Close"><X size={16} strokeWidth={2.4} /></button>
        </div>
        {state.done ? (
          <div className="stagger px-8 py-14 text-center">
            <span className="scale-in mx-auto grid size-16 place-items-center rounded-full bg-live text-white shadow-[0_12px_30px_-10px_rgb(52_199_89/0.6)]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            <h3 className="mt-5 text-2xl font-semibold" style={{ "--i": 1 } as React.CSSProperties}>Request sent</h3>
            <p className="mx-auto mt-2 max-w-sm text-graphite" style={{ "--i": 2 } as React.CSSProperties}>{first} will see it in their Epixo inbox and reply to {f.email} by email.</p>
            <div style={{ "--i": 3 } as React.CSSProperties}><button className="btn btn-quiet mt-8" onClick={onClose}>Done</button></div>
          </div>
        ) : (
          <form
            className="space-y-6 px-5 pb-6 pt-5 sm:px-6"
            onSubmit={async e => {
              e.preventDefault();
              setState({ busy: true });
              const r = await fetch(`/api/users/${handle}/hire`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(f) });
              const j = (await r.json().catch(() => ({}))) as { error?: string };
              setState(r.ok ? { done: true } : { err: j.error ?? "Could not send the request." });
            }}
          >
            <Group title="About you">
              <Row label="Name"><input className="row-input" value={f.name} onChange={set("name")} required maxLength={80} placeholder="Your name" autoComplete="name" /></Row>
              <Row label="Email"><input className="row-input" type="email" value={f.email} onChange={set("email")} required maxLength={200} placeholder="Where they can reply" autoComplete="email" /></Row>
              <Row label="Company"><input className="row-input" value={f.company} onChange={set("company")} maxLength={80} placeholder="Optional" autoComplete="organization" /></Row>
            </Group>
            <Group title="The work">
              <Row label="Type">
                <select className="row-input" value={f.kind} onChange={set("kind")}>
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </Row>
              <Row label="Budget"><input className="row-input" value={f.budget} onChange={set("budget")} maxLength={60} placeholder="e.g. ₹40,000 or $500" /></Row>
              <Row label="Timeline"><input className="row-input" value={f.timeline} onChange={set("timeline")} maxLength={60} placeholder="e.g. 3 weeks" /></Row>
            </Group>
            <Group title="Message" note="Describe the board, the screens you need and anything already built.">
              <textarea className="row-input min-h-[140px] resize-y py-3" value={f.message} onChange={set("message")} required minLength={20} maxLength={3000} placeholder={`Hi ${first}, I saw your projects on Epixo and…`} />
            </Group>
            {state.err && <p key={state.err} className="scale-in rounded-xl bg-danger-soft px-4 py-3 text-[15px] text-danger">{state.err}</p>}
            <button className="btn btn-primary btn-lg w-full" disabled={state.busy}>{state.busy ? "Sending…" : "Send request"}</button>
            <p className="text-center text-xs text-mist">Your email is shared only with {first}. Epixo never shows it publicly.</p>
          </form>
        )}
      </div>
    </div>
  );
}

export function Group({ title, note, children }: { title?: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      {title && <h3 className="group-title font-sans tracking-normal">{title}</h3>}
      <div className="inset-group [&>*]:px-4">{children}</div>
      {note && <p className="group-note">{note}</p>}
    </section>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-h-[48px] items-center gap-4">
      <span className="w-24 shrink-0 text-[16px] text-ink">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
