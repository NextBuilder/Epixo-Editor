import { fail, first, guard, json, newId, now, run } from "@/lib/server";
import { cleanTags, readProject } from "@/lib/project";
import { deleteMedia, putMedia } from "@/lib/media";
import { notify } from "@/lib/notify";

const PNG = [137, 80, 78, 71, 13, 10, 26, 10];

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(req, { auth: true, rate: ["publish", 10, 600] });
  if (g.error) return g.error;
  const user = g.user!;
  const project = await first<{ json: string; owner_id: string }>("SELECT json, owner_id FROM projects WHERE id = ?", id);
  if (!project || project.owner_id !== user.id) return fail("Save the project to your account first.", 404);
  const meta = readProject(project.json);
  if (!meta) return fail("This project could not be read.");
  const form = await req.formData().catch(() => null);
  if (!form) return fail("Bad upload");
  const title = String(form.get("title") ?? "").trim().slice(0, 80);
  const description = String(form.get("description") ?? "").trim().slice(0, 2000);
  const tags = cleanTags(String(form.get("tags") ?? ""));
  if (title.length < 3) return fail("Give your project a title of at least 3 characters.");
  const files = form.getAll("images").filter((f): f is File => f instanceof File).slice(0, 12);
  if (!files.length) return fail("Add at least one screen image.");
  const bufs: ArrayBuffer[] = [];
  for (const f of files) {
    if (f.size > 3_000_000) return fail("Each screen image must be under 3 MB.");
    const b = await f.arrayBuffer();
    const head = new Uint8Array(b, 0, 8);
    if (!PNG.every((v, i) => head[i] === v)) return fail("Screen images must be PNG.");
    bufs.push(b);
  }
  const existing = await first<{ id: string; images: string }>("SELECT id, images FROM posts WHERE project_id = ?", id);
  const postId = existing?.id ?? newId(10);
  const keys: string[] = [];
  for (let i = 0; i < bufs.length; i++) {
    const key = `posts/${postId}/${i + 1}-${newId(8)}.png`;
    await putMedia(key, bufs[i], "image/png");
    keys.push(key);
  }
  const t = now();
  if (existing) {
    for (const k of JSON.parse(existing.images) as string[]) await deleteMedia(k);
    await run("UPDATE posts SET title = ?, description = ?, tags = ?, board_id = ?, board_label = ?, brand = ?, w = ?, h = ?, round = ?, images = ?, json = ?, updated_at = ? WHERE id = ?",
      title, description, tags, meta.boardId, meta.boardLabel, meta.brand, meta.w, meta.h, meta.round ? 1 : 0, JSON.stringify(keys), project.json, t, postId);
  } else {
    const origin = meta.remixOf ? await first<{ id: string; owner_id: string }>("SELECT id, owner_id FROM posts WHERE id = ? AND hidden = 0", meta.remixOf) : null;
    await run("INSERT INTO posts (id, project_id, owner_id, title, description, tags, board_id, board_label, brand, w, h, round, images, json, remix_of, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      postId, id, user.id, title, description, tags, meta.boardId, meta.boardLabel, meta.brand, meta.w, meta.h, meta.round ? 1 : 0, JSON.stringify(keys), project.json, origin?.id ?? null, t, t);
    if (origin) {
      await run("UPDATE posts SET remixes = remixes + 1 WHERE id = ?", origin.id);
      await notify(origin.owner_id, user.id, "remix", postId, title);
    }
  }
  return json({ ok: true, id: postId, url: `/community/${postId}` });
}
