import { fail, first, guard, json, now, run } from "@/lib/server";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true, rate: ["save-post", 60, 60] });
  if (g.error) return g.error;
  if (!(await first("SELECT 1 FROM posts WHERE id = ? AND hidden = 0", id))) return fail("Not found", 404);
  const had = await first("SELECT 1 FROM saves WHERE post_id = ? AND user_id = ?", id, g.user!.id);
  if (had) await run("DELETE FROM saves WHERE post_id = ? AND user_id = ?", id, g.user!.id);
  else await run("INSERT INTO saves (post_id, user_id, created_at) VALUES (?, ?, ?)", id, g.user!.id, now());
  return json({ saved: !had });
}
