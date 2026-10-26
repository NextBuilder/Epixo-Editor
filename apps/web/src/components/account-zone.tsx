"use client";

import { useState } from "react";
import { Download, LogOut, MonitorSmartphone, Trash2 } from "lucide-react";

export function AccountZone({ handle }: { handle: string }) {
  const [ask, setAsk] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const out = async (all: boolean) => { await fetch(`/api/auth/logout${all ? "?all=1" : ""}`, { method: "POST" }); location.href = "/"; };
  const row = "flex min-h-[48px] w-full items-center gap-3.5 px-4 text-left text-[16px] transition-colors hover:bg-fill";
  return (
    <section>
      <h3 className="group-title font-sans tracking-normal">Account and privacy</h3>
      <div className="inset-group">
        <a href="/api/me/export" className={row} download><Download size={18} className="text-graphite" /><span className="flex-1">Download your data</span></a>
        <button className={row} onClick={() => out(false)}><LogOut size={18} className="text-graphite" /><span className="flex-1">Sign out</span></button>
        <button className={row} onClick={() => out(true)}><MonitorSmartphone size={18} className="text-graphite" /><span className="flex-1">Sign out of every device</span></button>
        <button className={`${row} text-danger`} onClick={() => setAsk(a => !a)} aria-expanded={ask}><Trash2 size={18} /><span className="flex-1">Delete account</span></button>
        {ask && (
          <form className="rise space-y-3 px-4 py-4" onSubmit={async e => {
            e.preventDefault();
            setErr("");
            const r = await fetch("/api/me", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm }) });
            if (r.ok) location.href = "/";
            else setErr(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "Could not delete the account.");
          }}>
            <p className="text-[15px] text-graphite">This deletes your profile, projects, published posts, comments and connections for good. Type <b className="text-ink">{handle}</b> to confirm.</p>
            <input className="field" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={handle} autoComplete="off" aria-label="Your handle" />
            {err && <p className="text-[14px] text-danger">{err}</p>}
            <button className="btn btn-sm w-full bg-danger text-white hover:opacity-90" disabled={confirm.trim().toLowerCase() !== handle}>Delete my account</button>
          </form>
        )}
      </div>
      <p className="group-note">Your data downloads as a JSON file, including every project.</p>
    </section>
  );
}
