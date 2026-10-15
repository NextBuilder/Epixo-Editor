import { fail, first, guard, isAdmin, json, run } from "@/lib/server";
import { deleteMedia } from "@/lib/media";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  const post = await first<{ owner_id: string; images: string }>("SELECT owner_id, images FROM posts WHERE id = ?", id);
  if (!post) return fail("Not found", 404);
  if (post.owner_id !== g.user!.id && !(await isAdmin(g.user))) return fail("Not allowed", 403);
  for (const k of JSON.parse(post.images) as string[]) await deleteMedia(k);
  await run("DELETE FROM posts WHERE id = ?", id);
  return json({ ok: true });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  if (!(await isAdmin(g.user))) return fail("Not allowed", 403);
  const body = (await req.json().catch(() => ({}))) as { hidden?: boolean };
  await run("UPDATE posts SET hidden = ? WHERE id = ?", body.hidden ? 1 : 0, id);
  return json({ ok: true });
}
