import { all, guard } from "@/lib/server";

// Everything Epixo keeps about the signed-in maker, as one JSON file.
export async function GET(req: Request) {
  const g = await guard(req, { auth: true, rate: ["export", 5, 3600] });
  if (g.error) return g.error;
  const u = g.user!;
  const [projects, posts, comments, likes, follows, received, sent, connections] = await Promise.all([
    all<{ json: string }>("SELECT id, name, json, created_at, updated_at FROM projects WHERE owner_id = ?", u.id),
    all("SELECT id, title, description, tags, board_label, likes, remixes, views, comments, created_at FROM posts WHERE owner_id = ?", u.id),
    all("SELECT post_id, body, created_at FROM comments WHERE user_id = ?", u.id),
    all("SELECT post_id, created_at FROM likes WHERE user_id = ?", u.id),
    all("SELECT u.handle, f.created_at FROM follows f JOIN users u ON u.id = f.followee_id WHERE f.follower_id = ?", u.id),
    all("SELECT name, email, company, kind, budget, timeline, message, status, created_at FROM hire_requests WHERE to_user = ?", u.id),
    all("SELECT name, email, company, kind, budget, timeline, message, created_at FROM hire_requests WHERE from_user = ?", u.id),
    all("SELECT label, client, created_at, last_used_at FROM ai_connections WHERE user_id = ?", u.id).catch(() => []),
  ]);
  const { id: _id, ...profile } = u;
  const data = {
    exported_at: new Date().toISOString(),
    profile,
    projects: projects.map(p => ({ ...p, json: JSON.parse(p.json) })),
    posts, comments, likes, following: follows, hire_requests_received: received, hire_requests_sent: sent, ai_connections: connections,
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="epixo-${u.handle}.json"`, "cache-control": "no-store" },
  });
}
