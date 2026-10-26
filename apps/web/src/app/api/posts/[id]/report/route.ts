import { fail, first, guard, json, newId, now, run } from "@/lib/server";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true, rate: ["report", 5, 600] });
  if (g.error) return g.error;
  const reason = String(((await req.json().catch(() => ({}))) as { reason?: string }).reason ?? "").trim().slice(0, 500);
  if (reason.length < 3) return fail("Tell us briefly what is wrong.");
  if (!(await first("SELECT 1 FROM posts WHERE id = ?", id))) return fail("Not found", 404);
  if (await first("SELECT 1 FROM reports WHERE post_id = ? AND user_id = ?", id, g.user!.id)) return json({ ok: true });
  await run("INSERT INTO reports (id, post_id, user_id, reason, created_at) VALUES (?, ?, ?, ?, ?)", newId(12), id, g.user!.id, reason, now());
  return json({ ok: true });
}
