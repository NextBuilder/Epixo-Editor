"use client";

import { useState } from "react";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ ok?: boolean; msg?: string; busy?: boolean }>({});
  if (state.ok) return <p className="scale-in mt-8 rounded-2xl bg-white/10 px-4 py-3.5 text-[15px]">You are on the list.</p>;
  return (
    <form
      className="mt-8"
      onSubmit={async e => {
        e.preventDefault();
        setState({ busy: true });
        const r = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setState(r.ok ? { ok: true } : { msg: j.error ?? "Could not add you. Try again." });
      }}
    >
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="h-[52px] min-w-0 flex-1 rounded-full bg-white/10 px-5 text-[16px] text-white outline-none placeholder:text-white/40 focus:bg-white/15 focus:ring-2 focus:ring-[#2997FF]" aria-label="Email address" />
        <button className="btn btn-lg bg-white text-[#1D1D1F] hover:bg-white/90" disabled={state.busy}>Notify me</button>
      </div>
      {state.msg && <p className="mt-2 text-[14px] text-[#FF6961]">{state.msg}</p>}
    </form>
  );
}
