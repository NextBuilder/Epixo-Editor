import { fail, first, guard, json, now, run } from "@/lib/server";
import { notify } from "@/lib/notify";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true, rate: ["like", 60, 60] });
  if (g.error) return g.error;
  const post = await first<{ owner_id: string }>("SELECT owner_id FROM posts WHERE id = ? AND hidden = 0", id);
  if (!post) return fail("Not found", 404);
  const had = await first("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?", id, g.user!.id);
  if (had) {
    await run("DELETE FROM likes WHERE post_id = ? AND user_id = ?", id, g.user!.id);
    await run("UPDATE posts SET likes = MAX(likes - 1, 0) WHERE id = ?", id);
  } else {
    await run("INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)", id, g.user!.id, now());
    await run("UPDATE posts SET likes = likes + 1 WHERE id = ?", id);
    await notify(post.owner_id, g.user!.id, "like", id);
  }
  const row = await first<{ likes: number }>("SELECT likes FROM posts WHERE id = ?", id);
  return json({ liked: !had, likes: row?.likes ?? 0 });
}
