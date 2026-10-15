import { fail, first, guard, json, now, run } from "@/lib/server";

export async function POST(req: Request, ctx: { params: Promise<{ handle: string }> }) {
  const { handle } = await ctx.params;
  const g = await guard(req, { auth: true, rate: ["follow", 60, 60] });
  if (g.error) return g.error;
  const target = await first<{ id: string }>("SELECT id FROM users WHERE handle = ?", handle.toLowerCase());
  if (!target) return fail("Maker not found", 404);
  if (target.id === g.user!.id) return fail("You cannot follow yourself.");
  const had = await first("SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?", g.user!.id, target.id);
  if (had) await run("DELETE FROM follows WHERE follower_id = ? AND followee_id = ?", g.user!.id, target.id);
  else await run("INSERT INTO follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)", g.user!.id, target.id, now());
  const c = await first<{ n: number }>("SELECT COUNT(*) AS n FROM follows WHERE followee_id = ?", target.id);
  return json({ following: !had, followers: c?.n ?? 0 });
}
