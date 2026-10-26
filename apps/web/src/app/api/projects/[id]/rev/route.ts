import { fail, first, guard, json } from "@/lib/server";

type Ctx = { params: Promise<{ id: string }> };

// A cheap check the editor polls, so changes made by a connected AI show up while the project is open.
export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true, rate: ["rev", 60, 60] });
  if (g.error) return g.error;
  const row = await first<{ updated_at: number; updated_by: string; update_note: string }>("SELECT updated_at, updated_by, update_note FROM projects WHERE id = ? AND owner_id = ?", id, g.user!.id);
  if (!row) return fail("Project not found", 404);
  return json(row);
}
