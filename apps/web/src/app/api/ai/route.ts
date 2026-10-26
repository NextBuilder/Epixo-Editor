import { env, fail, first, guard, json, newId, now, run } from "@/lib/server";

type Body = { system?: string; messages?: unknown[]; tools?: { name: string; description: string; input_schema?: unknown }[]; max_tokens?: number };

export async function POST(req: Request) {
  const g = await guard(req, { auth: true, rate: ["ai", 40, 60] });
  if (g.error) return g.error;
  const e = await env();
  if (!e.ANTHROPIC_API_KEY) return fail("AI is not switched on for this site yet.", 503);
  const raw = await req.text();
  if (raw.length > 4_000_000) return fail("That request is too large.", 413);
  let body: Body;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("Bad request");
  }
  if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 80) return fail("Bad request");
  const tools = Array.isArray(body.tools) ? body.tools.slice(0, 24).map(t => ({ name: String(t.name).slice(0, 64), description: String(t.description).slice(0, 1024), input_schema: t.input_schema ?? { type: "object", properties: {} } })) : undefined;
  const take = await run("UPDATE users SET ai_credits = ai_credits - 1 WHERE id = ? AND ai_credits > 0", g.user!.id);
  if (!take.meta.changes) return fail("You have used all your AI credits.", 402);
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": e.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: e.AI_MODEL || "claude-sonnet-5-5",
      max_tokens: Math.min(Math.max(Number(body.max_tokens) || 4096, 256), 8000),
      system: typeof body.system === "string" ? body.system.slice(0, 20000) : undefined,
      messages: body.messages,
      tools,
    }),
  });
  const out = (await r.json().catch(() => null)) as { content?: unknown; stop_reason?: string; usage?: { input_tokens: number; output_tokens: number }; error?: { message?: string } } | null;
  if (!r.ok || !out) {
    await run("UPDATE users SET ai_credits = ai_credits + 1 WHERE id = ?", g.user!.id);
    return fail(out?.error?.message ? "The AI service said: " + out.error.message : "The AI service is busy. Try again.", r.status === 429 ? 429 : 502);
  }
  if (out.usage) await run("INSERT INTO ai_usage (id, user_id, input_tokens, output_tokens, created_at) VALUES (?, ?, ?, ?, ?)", newId(12), g.user!.id, out.usage.input_tokens, out.usage.output_tokens, now());
  const left = await first<{ ai_credits: number }>("SELECT ai_credits FROM users WHERE id = ?", g.user!.id);
  return json({ content: out.content, stop_reason: out.stop_reason, usage: out.usage, credits: left?.ai_credits ?? 0 });
}
