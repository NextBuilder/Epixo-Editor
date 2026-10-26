import { fail, first, guard, json, now, run } from "@/lib/server";
import { readProject } from "@/lib/project";

type Ctx = { params: Promise<{ id: string }> };
const validId = (id: string) => /^[a-z0-9]{6,40}$/i.test(id);

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  const row = await first<{ json: string }>("SELECT json FROM projects WHERE id = ? AND owner_id = ?", id, g.user!.id);
  if (!row) return fail("Project not found", 404);
  return new Response(row.json, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!validId(id)) return fail("Bad project id");
  const g = await guard(req, { auth: true, rate: ["save", 120, 60] });
  if (g.error) return g.error;
  const text = await req.text();
  const meta = readProject(text);
  if (!meta) return fail("That is not a valid Epixo project, or it is larger than 600 KB.");
  const owner = await first<{ owner_id: string }>("SELECT owner_id FROM projects WHERE id = ?", id);
  if (owner && owner.owner_id !== g.user!.id) return fail("This project belongs to someone else.", 403);
  const t = now();
  if (owner) await run("UPDATE projects SET name = ?, board_id = ?, board_label = ?, w = ?, h = ?, screens = ?, json = ?, updated_at = ?, updated_by = '', update_note = '' WHERE id = ?", meta.name, meta.boardId, meta.boardLabel, meta.w, meta.h, meta.screens, text, t, id);
  else {
    const count = await first<{ n: number }>("SELECT COUNT(*) AS n FROM projects WHERE owner_id = ?", g.user!.id);
    if ((count?.n ?? 0) >= 500) return fail("You have reached 500 saved projects. Delete some to save more.", 403);
    await run("INSERT INTO projects (id, owner_id, name, board_id, board_label, w, h, screens, json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", id, g.user!.id, meta.name, meta.boardId, meta.boardLabel, meta.w, meta.h, meta.screens, text, t, t);
  }
  return json({ ok: true, updated_at: t });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  await run("DELETE FROM projects WHERE id = ? AND owner_id = ?", id, g.user!.id);
  return json({ ok: true });
}
