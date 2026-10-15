import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

export async function env(): Promise<CloudflareEnv> {
  return (await getCloudflareContext({ async: true })).env as CloudflareEnv;
}

export const now = () => Math.floor(Date.now() / 1000);

export function newId(len = 12) {
  const a = "abcdefghijkmnpqrstuvwxyz23456789";
  const b = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(b, x => a[x % a.length]).join("");
}

export async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d), x => x.toString(16).padStart(2, "0")).join("");
}

export async function all<T>(sql: string, ...args: unknown[]): Promise<T[]> {
  const e = await env();
  return (await e.DB.prepare(sql).bind(...args).all<T>()).results ?? [];
}

export async function first<T>(sql: string, ...args: unknown[]): Promise<T | null> {
  const e = await env();
  return (await e.DB.prepare(sql).bind(...args).first<T>()) ?? null;
}

export async function run(sql: string, ...args: unknown[]) {
  const e = await env();
  return e.DB.prepare(sql).bind(...args).run();
}

export type User = {
  id: string;
  handle: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  plan: string;
  ai_credits: number;
  created_at: number;
  headline: string;
  location: string;
  socials: string;
  skills: string;
  hire_open: number;
  hire_types: string;
  hire_rate: string;
  hire_note: string;
  pinned_post: string | null;
};

export const isProduction = (e: CloudflareEnv) => e.SITE_URL.startsWith("https://");
const sessionCookie = (e: CloudflareEnv) => (isProduction(e) ? "__Host-epx_session" : "epx_session");

export async function currentUser(): Promise<User | null> {
  const c = await cookies();
  const token = c.get(sessionCookie(await env()))?.value;
  if (!token || token.length < 20) return null;
  const sid = await sha256(token);
  return first<User>(
    "SELECT u.id, u.handle, u.name, u.avatar, u.bio, u.role, u.plan, u.ai_credits, u.created_at, u.headline, u.location, u.socials, u.skills, u.hire_open, u.hire_types, u.hire_rate, u.hire_note, u.pinned_post FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?",
    sid,
    now(),
  );
}

export async function startSession(userId: string) {
  const token = newId(40);
  await run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", await sha256(token), userId, now() + 60 * 60 * 24 * 30);
  const e = await env();
  const c = await cookies();
  c.set(sessionCookie(e), token, { httpOnly: true, secure: isProduction(e), sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function endSession() {
  const c = await cookies();
  const name = sessionCookie(await env());
  const token = c.get(name)?.value;
  if (token) await run("DELETE FROM sessions WHERE id = ?", await sha256(token));
  c.delete(name);
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return req.method === "GET";
  const e = await env();
  const host = new URL(req.url).host;
  return new URL(origin).host === host || origin === e.SITE_URL;
}

export async function limit(key: string, max: number, windowSec: number) {
  const t = now();
  const row = await first<{ count: number; reset_at: number }>("SELECT count, reset_at FROM rate WHERE key = ?", key);
  if (!row || row.reset_at <= t) {
    await run("INSERT INTO rate (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at", key, t + windowSec);
    return true;
  }
  if (row.count >= max) return false;
  await run("UPDATE rate SET count = count + 1 WHERE key = ?", key);
  return true;
}

export async function guard(req: Request, opts: { auth?: boolean; rate?: [string, number, number] } = {}) {
  if (req.method !== "GET" && !(await sameOrigin(req))) return { error: fail("Cross-site request blocked", 403) };
  const user = await currentUser();
  if (opts.auth && !user) return { error: fail("Please sign in", 401) };
  if (opts.rate) {
    const [name, max, win] = opts.rate;
    const ip = req.headers.get("cf-connecting-ip") ?? "local";
    if (!(await limit(`${name}:${user?.id ?? ip}`, max, win))) return { error: fail("Too many requests. Try again in a minute.", 429) };
  }
  return { user };
}

export async function isAdmin(u: User | null) {
  if (!u) return false;
  if (u.role === "admin") return true;
  const e = await env();
  return (e.ADMIN_HANDLES ?? "").split(",").map(s => s.trim().toLowerCase()).includes(u.handle.toLowerCase());
}
