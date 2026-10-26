import type { Metadata } from "next";
import { AiConnections } from "@/components/ai-connections";
import { all, currentUser, env } from "@/lib/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Design with Claude or ChatGPT",
  description: "Connect Claude, ChatGPT or Claude Code to Epixo. Describe a screen and watch your AI build it in the editor, ready to export for your ESP32 display.",
};

export default async function Connect() {
  const u = await currentUser();
  const e = await env();
  const rows = u ? await all<{ id: string; label: string; client: string; created_at: number; last_used_at: number | null }>("SELECT id, label, client, created_at, last_used_at FROM ai_connections WHERE user_id = ? ORDER BY created_at DESC", u.id).catch(() => []) : [];
  return (
    <div className="page-enter mx-auto max-w-[860px] px-4 pt-14 pb-32 sm:px-6">
      <p className="text-[13px] font-semibold tracking-wide text-signal uppercase">AI connections</p>
      <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Design with the AI you already use</h1>
      <p className="mt-4 max-w-2xl text-lg text-graphite">
        Connect Claude or ChatGPT to Epixo. Ask for a screen in plain words, and your AI builds it with real LVGL widgets while you watch it appear in the editor. You can change anything by hand, and the AI sees your changes too.
      </p>
      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Make a link", "One private link per app. It lets that app edit your Epixo projects, nothing else."],
          ["Paste it into your AI app", "Claude and ChatGPT both accept it as a connector. The steps are below."],
          ["Ask for a screen", "Try “a thermostat for my round display”. Keep the editor open to watch it build."],
        ].map(([t, d], i) => (
          <li key={t} className="rounded-[20px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <span className="grid size-8 place-items-center rounded-full bg-signal-soft font-display text-sm font-semibold text-signal">{i + 1}</span>
            <p className="mt-3 font-semibold">{t}</p>
            <p className="mt-1 text-[15px] text-graphite">{d}</p>
          </li>
        ))}
      </ol>
      <AiConnections signedIn={!!u} site={e.SITE_URL} initial={rows} />
    </div>
  );
}
