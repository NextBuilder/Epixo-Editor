import { z } from "zod";
import { createConnection } from "@/lib/mcp";
import { all, fail, first, guard, json } from "@/lib/server";

export async function GET(req: Request) {
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  const rows = await all("SELECT id, label, client, created_at, last_used_at FROM ai_connections WHERE user_id = ? ORDER BY created_at DESC", g.user!.id);
  return json({ connections: rows });
}

const Body = z.object({ label: z.string().trim().min(1).max(40) });

export async function POST(req: Request) {
  const g = await guard(req, { auth: true, rate: ["connect", 10, 3600] });
  if (g.error) return g.error;
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return fail("Give the connection a short name.");
  const n = await first<{ n: number }>("SELECT COUNT(*) AS n FROM ai_connections WHERE user_id = ?", g.user!.id);
  if ((n?.n ?? 0) >= 10) return fail("You can have 10 connections. Remove one you no longer use.", 403);
  const { id, token } = await createConnection(g.user!.id, b.data.label);
  return json({ id, token });
}
