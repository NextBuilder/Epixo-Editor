import { getMedia, MEDIA_CACHE } from "@/lib/media";

const OK = [/^posts\/[a-z0-9]+\/[a-z0-9-]+\.png$/, /^avatars\/[a-z0-9]+\/[a-z0-9]+\.(png|jpg|webp)$/];

export async function GET(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const k = key.join("/");
  if (!OK.some(r => r.test(k))) return new Response("Not found", { status: 404 });
  const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
  const id = new Request(new URL(req.url).toString());
  const hit = await cache?.match(id).catch(() => undefined);
  if (hit) return hit;
  const obj = await getMedia(k);
  if (!obj) return new Response("Not found", { status: 404 });
  const res = new Response(obj.body, { headers: { "content-type": obj.type, "cache-control": MEDIA_CACHE, "x-content-type-options": "nosniff" } });
  if (cache) await cache.put(id, res.clone()).catch(() => {});
  return res;
}
