import { fail, first, guard, isAdmin, json, run } from "@/lib/server";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  const c = await first<{ user_id: string; post_id: string; owner_id: string }>("SELECT c.user_id, c.post_id, p.owner_id FROM comments c JOIN posts p ON p.id = c.post_id WHERE c.id = ?", id);
  if (!c) return fail("Not found", 404);
  if (c.user_id !== g.user!.id && c.owner_id !== g.user!.id && !(await isAdmin(g.user))) return fail("Not allowed", 403);
  await run("DELETE FROM comments WHERE id = ?", id);
  await run("UPDATE posts SET comments = MAX(comments - 1, 0) WHERE id = ?", c.post_id);
  return json({ ok: true });
}
