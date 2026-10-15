"use client";

import { useState } from "react";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ ok?: boolean; msg?: string }>({});
  if (state.ok) return <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-[15px]">You are on the list. We will email you when Pro opens.</p>;
  return (
    <form
      className="mt-6"
      onSubmit={async e => {
        e.preventDefault();
        const r = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setState(r.ok ? { ok: true } : { msg: j.error ?? "Could not add you. Try again." });
      }}
    >
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 min-w-0 flex-1 rounded-xl bg-white/10 px-3.5 text-white outline-none ring-1 ring-white/20 placeholder:text-white/40 focus:ring-2 focus:ring-[#7FB2FF]" aria-label="Email address" />
        <button className="btn bg-white text-ink hover:bg-white/90">Join the list</button>
      </div>
      {state.msg && <p className="mt-2 text-sm text-[#FFB4B4]">{state.msg}</p>}
    </form>
  );
}
