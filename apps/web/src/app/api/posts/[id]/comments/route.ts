import { all, fail, first, guard, json, newId, now, run } from "@/lib/server";
import { notify } from "@/lib/notify";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const rows = await all(
    "SELECT c.id, c.body, c.created_at, u.handle, u.name, u.avatar, u.id AS user_id FROM comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = ? AND c.hidden = 0 ORDER BY c.created_at ASC LIMIT 300",
    id,
  );
  return json({ comments: rows });
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true, rate: ["comment", 10, 60] });
  if (g.error) return g.error;
  const body = String(((await req.json().catch(() => ({}))) as { body?: string }).body ?? "").trim();
  if (body.length < 2 || body.length > 1000) return fail("Comments are 2 to 1,000 characters.");
  const post = await first<{ owner_id: string }>("SELECT owner_id FROM posts WHERE id = ? AND hidden = 0", id);
  if (!post) return fail("Not found", 404);
  const cid = newId(12);
  await run("INSERT INTO comments (id, post_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?)", cid, id, g.user!.id, body, now());
  await run("UPDATE posts SET comments = comments + 1 WHERE id = ?", id);
  await notify(post.owner_id, g.user!.id, "comment", id, body);
  return json({ ok: true, comment: { id: cid, body, created_at: now(), handle: g.user!.handle, name: g.user!.name, avatar: g.user!.avatar, user_id: g.user!.id } });
}
