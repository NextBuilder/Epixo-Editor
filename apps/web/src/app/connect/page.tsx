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
    <div className="wrap-narrow pt-12 sm:pt-16">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-[20px] text-white shadow-[0_14px_30px_-12px_rgb(191_90_242/0.6)]" style={{ background: "conic-gradient(from 200deg, #0A84FF, #BF5AF2, #FF375F, #FF9F0A, #0A84FF)" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /></svg>
        </span>
        <h1 className="t-display mt-6">Design with the AI you already use.</h1>
        <p className="t-lead mx-auto mt-3 max-w-lg">Connect Claude or ChatGPT. Ask for a screen and watch it build in the editor.</p>
      </div>
      <AiConnections signedIn={!!u} site={e.SITE_URL} initial={rows} />
    </div>
  );
}
