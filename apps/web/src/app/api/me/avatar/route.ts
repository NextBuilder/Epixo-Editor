import { fail, guard, json, newId, run } from "@/lib/server";
import { deleteMedia, putMedia } from "@/lib/media";

const SIG: [string, number[]][] = [
  ["png", [0x89, 0x50, 0x4e, 0x47]],
  ["jpg", [0xff, 0xd8, 0xff]],
  ["webp", [0x52, 0x49, 0x46, 0x46]],
];

export async function POST(req: Request) {
  const g = await guard(req, { auth: true, rate: ["avatar", 10, 600] });
  if (g.error) return g.error;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("Choose an image.");
  if (file.size > 2_000_000) return fail("Profile photos must be under 2 MB.");
  const buf = await file.arrayBuffer();
  const head = new Uint8Array(buf, 0, 12);
  const kind = SIG.find(([, s]) => s.every((v, i) => head[i] === v))?.[0];
  if (!kind || (kind === "webp" && String.fromCharCode(...head.slice(8, 12)) !== "WEBP")) return fail("Use a PNG, JPEG or WebP image.");
  const key = `avatars/${g.user!.id.toLowerCase()}/${newId(10)}.${kind}`;
  await putMedia(key, buf, kind === "jpg" ? "image/jpeg" : `image/${kind}`);
  const old = g.user!.avatar;
  if (old?.startsWith("/api/media/avatars/")) await deleteMedia(old.slice("/api/media/".length)).catch(() => {});
  const url = `/api/media/${key}`;
  await run("UPDATE users SET avatar = ? WHERE id = ?", url, g.user!.id);
  return json({ ok: true, avatar: url });
}

export async function DELETE(req: Request) {
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  const old = g.user!.avatar;
  if (old?.startsWith("/api/media/avatars/")) {
    await deleteMedia(old.slice("/api/media/".length)).catch(() => {});
  }
  await run("UPDATE users SET avatar = NULL WHERE id = ?", g.user!.id);
  return json({ ok: true });
}
