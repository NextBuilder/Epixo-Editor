import { guard, json, run } from "@/lib/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  await run("DELETE FROM ai_connections WHERE id = ? AND user_id = ?", id, g.user!.id);
  return json({ ok: true });
}
