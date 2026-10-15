import { fail, first, guard } from "@/lib/server";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(req, { rate: ["remix", 60, 60] });
  if (g.error) return g.error;
  const row = await first<{ json: string; title: string }>("SELECT json, title FROM posts WHERE id = ? AND hidden = 0", id);
  if (!row) return fail("Project not found", 404);
  return new Response(row.json, { headers: { "content-type": "application/json", "cache-control": "no-store", "content-disposition": `attachment; filename="${row.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.epixo.json"` } });
}
