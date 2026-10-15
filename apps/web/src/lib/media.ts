import { env } from "./server";

const CACHE = "public, max-age=31536000, immutable";

export async function putMedia(key: string, data: ArrayBuffer, type: string) {
  const e = await env();
  if (e.MEDIA) await e.MEDIA.put(key, data, { httpMetadata: { contentType: type, cacheControl: CACHE } });
  else await e.MEDIA_KV!.put(key, data, { metadata: { type } });
}

export async function getMedia(key: string): Promise<{ body: ReadableStream | ArrayBuffer; type: string } | null> {
  const e = await env();
  const obj = e.MEDIA ? await e.MEDIA.get(key) : null;
  if (obj) return { body: obj.body, type: obj.httpMetadata?.contentType ?? "image/png" };
  if (!e.MEDIA_KV) return null;
  const kv = await e.MEDIA_KV.getWithMetadata<{ type: string }>(key, "arrayBuffer");
  return kv.value ? { body: kv.value, type: kv.metadata?.type ?? "image/png" } : null;
}

export async function deleteMedia(key: string) {
  const e = await env();
  const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
  await Promise.all([e.MEDIA?.delete(key), e.MEDIA_KV?.delete(key), cache?.delete(new Request(`${e.SITE_URL}/api/media/${key}`)).catch(() => false)]);
}

export const MEDIA_CACHE = CACHE;
