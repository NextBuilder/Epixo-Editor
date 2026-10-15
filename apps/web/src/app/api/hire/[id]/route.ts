import { fail, guard, json, run } from "@/lib/server";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  const status = String(((await req.json().catch(() => ({}))) as { status?: string }).status);
  if (!["new", "read", "replied", "archived"].includes(status)) return fail("Bad status");
  const r = await run("UPDATE hire_requests SET status = ? WHERE id = ? AND to_user = ?", status, id, g.user!.id);
  if (!r.meta.changes) return fail("Not found", 404);
  return json({ ok: true });
}
