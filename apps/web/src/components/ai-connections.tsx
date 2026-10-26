"use client";

import { useState } from "react";
import { Check, Copy, Link2, Trash2 } from "@/components/icons";
import { timeAgo } from "@/lib/data";

type Conn = { id: string; label: string; client: string; created_at: number; last_used_at: number | null };
type App = "claude" | "chatgpt" | "code" | "local";

const APPS: { key: App; name: string }[] = [
  { key: "claude", name: "Claude" },
  { key: "chatgpt", name: "ChatGPT" },
  { key: "code", name: "Claude Code" },
  { key: "local", name: "On your computer" },
];

function Steps({ app, link }: { app: App; link: string }) {
  const shown = link || "your link";
  if (app === "claude")
    return (
      <ol className="list-decimal space-y-2 pl-5 text-[15px] text-graphite">
        <li>In Claude on the web or the desktop app, open <b className="text-ink">Settings</b>, then <b className="text-ink">Connectors</b>.</li>
        <li>Choose <b className="text-ink">Add custom connector</b>. Name it <b className="text-ink">Epixo</b> and paste {link ? "the link above" : "your link"} as the URL.</li>
        <li>In a new chat, turn Epixo on from the tools menu and ask for a screen.</li>
      </ol>
    );
  if (app === "chatgpt")
    return (
      <ol className="list-decimal space-y-2 pl-5 text-[15px] text-graphite">
        <li>In ChatGPT, open <b className="text-ink">Settings</b>, then <b className="text-ink">Apps &amp; Connectors</b>. Under <b className="text-ink">Advanced settings</b>, turn on <b className="text-ink">Developer mode</b>.</li>
        <li>Choose <b className="text-ink">Create</b>. Name it <b className="text-ink">Epixo</b>, paste {link ? "the link above" : "your link"} as the server URL and pick <b className="text-ink">No authentication</b>. The link itself is the key.</li>
        <li>In a new chat, add Epixo from the + menu and ask for a screen.</li>
      </ol>
    );
  if (app === "code")
    return (
      <div className="space-y-2 text-[15px] text-graphite">
        <p>Run this once in your terminal:</p>
        <pre className="overflow-x-auto rounded-2xl bg-[#1D1D1F] p-4 font-mono text-[13px] text-[#F5F5F7]">claude mcp add --transport http epixo {shown}</pre>
        <p>Then ask Claude Code to design a screen, or to fit your Epixo UI into your firmware project.</p>
      </div>
    );
  return (
    <div className="space-y-2 text-[15px] text-graphite">
      <p>Prefer to keep everything on your own computer? The Epixo source includes a local server that works offline, saves projects as files and draws real LVGL previews your AI can look at.</p>
      <pre className="overflow-x-auto rounded-2xl bg-[#1D1D1F] p-4 font-mono text-[13px] text-[#F5F5F7]">{`{
  "mcpServers": {
    "epixo": { "command": "node", "args": ["/path/to/Epixo-Editor/apps/mcp/server.mjs"] }
  }
}`}</pre>
      <p>Add that to Claude Desktop&apos;s config, then open <b className="text-ink">localhost:7457</b> to watch the editor update live. No link is needed.</p>
    </div>
  );
}

export function AiConnections({ signedIn, site, initial }: { signedIn: boolean; site: string; initial: Conn[] }) {
  const [list, setList] = useState(initial);
  const [app, setApp] = useState<App>("claude");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function make() {
    setBusy(true);
    setErr("");
    const label = APPS.find(a => a.key === app)!.name;
    const r = await fetch("/api/connections", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ label }) });
    const j = (await r.json().catch(() => ({}))) as { id?: string; token?: string; error?: string };
    setBusy(false);
    if (!r.ok || !j.token) return setErr(j.error ?? "Could not make a link. Try again.");
    setLink(`${site}/api/mcp/${j.token}`);
    setList(l => [{ id: j.id!, label, client: "", created_at: Math.floor(Date.now() / 1000), last_used_at: null }, ...l]);
  }
  async function remove(id: string) {
    await fetch(`/api/connections/${id}`, { method: "DELETE" });
    setList(l => l.filter(c => c.id !== id));
  }
  function copy() {
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }

  return (
    <div className="mt-12 space-y-8">
      <section className="card p-6 sm:p-8">
        <div className="seg flex w-full" role="tablist">
          {APPS.map(a => (
            <button key={a.key} role="tab" aria-selected={app === a.key} data-on={app === a.key} onClick={() => setApp(a.key)} className="flex-1 justify-center">
              {a.name}
            </button>
          ))}
        </div>

        {app !== "local" && (
          <div className="mt-6">
            {!signedIn ? (
              <a href="/login?next=/connect" className="btn btn-primary btn-lg w-full">Sign in to make a link</a>
            ) : link ? (
              <div className="scale-in">
                <p className="text-[13px] font-medium text-mist">Copy it now. It is only shown once.</p>
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-fill p-1.5 pl-4">
                  <code className="min-w-0 flex-1 truncate font-mono text-[13px]">{link}</code>
                  <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy"}</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary btn-lg w-full" disabled={busy} onClick={make}><Link2 size={17} />{busy ? "Making your link…" : `Make a link for ${APPS.find(a => a.key === app)!.name}`}</button>
            )}
            {err && <p className="mt-3 text-[14px] text-danger">{err}</p>}
          </div>
        )}

        <div className="mt-6 pt-6 shadow-[inset_0_0.5px_0_var(--color-line-strong)]">
          <Steps app={app} link={link} />
        </div>
      </section>

      {signedIn && list.length > 0 && (
        <section>
          <h3 className="group-title font-sans tracking-normal">Your connections</h3>
          <div className="inset-group">
            {list.map(c => (
              <div key={c.id} className="flex min-h-[60px] items-center gap-4 px-4">
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{c.label}{c.client ? <span className="font-normal text-mist"> · {c.client}</span> : null}</span>
                  <span className="block text-[13px] text-mist">{c.last_used_at ? `Last used ${timeAgo(c.last_used_at)}` : "Not used yet"}</span>
                </span>
                <button className="btn btn-sm text-danger hover:bg-danger-soft" onClick={() => remove(c.id)} aria-label={`Remove ${c.label}`}><Trash2 size={16} />Remove</button>
              </div>
            ))}
          </div>
          <p className="group-note">Removing a connection stops its link at once. AI apps never see your sign-in.</p>
        </section>
      )}
    </div>
  );
}
