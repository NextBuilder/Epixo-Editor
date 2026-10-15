import { all, guard, json } from "@/lib/server";

export async function GET(req: Request) {
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  const rows = await all(
    "SELECT p.id, p.name, p.board_label, p.w, p.h, p.screens, p.updated_at, po.id AS post_id FROM projects p LEFT JOIN posts po ON po.project_id = p.id WHERE p.owner_id = ? ORDER BY p.updated_at DESC LIMIT 200",
    g.user!.id,
  );
  return json({ projects: rows });
}
