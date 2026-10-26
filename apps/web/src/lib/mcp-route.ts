import { connectionFor, handleRpc } from "./mcp";
import { env, fail, limit, now, run } from "./server";

// Shared by /api/mcp (token in an Authorization header) and /api/mcp/<token> (token in the link, for apps that only take a URL).
export async function serveMcp(req: Request, token: string) {
  const origin = req.headers.get("origin");
  if (origin) {
    const e = await env();
    if (new URL(origin).host !== new URL(req.url).host && origin !== e.SITE_URL) return fail("Cross-site request blocked", 403);
  }
  const c = await connectionFor(token);
  if (!c) return fail("This link is not valid any more. Make a new one at /connect.", 401);
  if (!(await limit(`mcp:${c.id}`, 240, 60))) return fail("Too many requests. Try again in a minute.", 429);
  const raw = await req.text();
  if (raw.length > 1_000_000) return fail("That request is too large.", 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }
  const many = Array.isArray(body);
  const list = (many ? (body as unknown[]) : [body]).slice(0, 20);
  if (list.some(m => (m as { method?: string })?.method === "initialize")) await run("UPDATE ai_connections SET last_used_at = ? WHERE id = ?", now(), c.id);
  const out = [];
  for (const m of list) {
    const r = await handleRpc(c, m);
    if (r) out.push(r);
  }
  if (!out.length) return new Response(null, { status: 202 });
  return new Response(JSON.stringify(many ? out : out[0]), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export const notAllowed = () => new Response(null, { status: 405, headers: { allow: "POST" } });
