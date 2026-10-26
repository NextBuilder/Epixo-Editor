import { cookies } from "next/headers";
import { env, first, run, newId, now, startSession } from "./server";

export const OAUTH_COOKIE = "epx_oauth";
export type Provider = "github" | "google";

type Profile = { provider: Provider; providerId: string; name: string; login: string; avatar: string | null };

function b64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Only paths on this site. Rejects "//host" and "/\\host", which browsers treat as another site, and control characters.
export function safeNext(n: string | null) {
  return n && n.length < 500 && /^\/(?![/\\])/.test(n) && !/[\\\u0000-\u001f]/.test(n) ? n : "/dashboard";
}

export async function beginOAuth(provider: Provider, next: string) {
  const e = await env();
  const state = newId(32);
  const verifier = newId(64);
  const challenge = b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
  const redirect = `${e.SITE_URL}/api/auth/${provider}/callback`;
  const c = await cookies();
  c.set(OAUTH_COOKIE, JSON.stringify({ state, verifier, next, provider }), { httpOnly: true, secure: e.SITE_URL.startsWith("https"), sameSite: "lax", path: "/", maxAge: 600 });
  if (provider === "github") {
    if (!e.GITHUB_CLIENT_ID) return null;
    const u = new URL("https://github.com/login/oauth/authorize");
    u.search = new URLSearchParams({ client_id: e.GITHUB_CLIENT_ID, redirect_uri: redirect, scope: "read:user", state }).toString();
    return u.toString();
  }
  if (!e.GOOGLE_CLIENT_ID) return null;
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({ client_id: e.GOOGLE_CLIENT_ID, redirect_uri: redirect, response_type: "code", scope: "openid profile email", state, code_challenge: challenge, code_challenge_method: "S256", prompt: "select_account" }).toString();
  return u.toString();
}

export async function finishOAuth(provider: Provider, code: string, state: string) {
  const e = await env();
  const c = await cookies();
  const raw = c.get(OAUTH_COOKIE)?.value;
  c.delete(OAUTH_COOKIE);
  if (!raw) return null;
  const saved = JSON.parse(raw) as { state: string; verifier: string; next: string; provider: string };
  if (saved.state !== state || saved.provider !== provider) return null;
  const redirect = `${e.SITE_URL}/api/auth/${provider}/callback`;
  let profile: Profile | null = null;
  if (provider === "github") {
    const t = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ client_id: e.GITHUB_CLIENT_ID, client_secret: e.GITHUB_CLIENT_SECRET, code, redirect_uri: redirect }),
    }).then(r => r.json() as Promise<{ access_token?: string }>);
    if (!t.access_token) return null;
    const g = await fetch("https://api.github.com/user", { headers: { authorization: `Bearer ${t.access_token}`, "user-agent": "Epixo", accept: "application/vnd.github+json" } }).then(r => r.json() as Promise<{ id: number; login: string; name: string | null; avatar_url: string }>);
    if (!g.id) return null;
    profile = { provider, providerId: String(g.id), name: g.name || g.login, login: g.login, avatar: g.avatar_url };
  } else {
    const t = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: e.GOOGLE_CLIENT_ID ?? "", client_secret: e.GOOGLE_CLIENT_SECRET ?? "", redirect_uri: redirect, grant_type: "authorization_code", code_verifier: saved.verifier }),
    }).then(r => r.json() as Promise<{ access_token?: string }>);
    if (!t.access_token) return null;
    const g = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${t.access_token}` } }).then(r => r.json() as Promise<{ sub: string; name?: string; email?: string; picture?: string }>);
    if (!g.sub) return null;
    profile = { provider, providerId: g.sub, name: g.name || (g.email ?? "Maker").split("@")[0], login: (g.email ?? g.name ?? "maker").split("@")[0], avatar: g.picture ?? null };
  }
  const userId = await upsertUser(profile);
  await startSession(userId);
  return saved.next;
}

async function uniqueHandle(base: string) {
  const clean = base.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20) || "maker";
  let h = clean;
  for (let i = 2; await first("SELECT 1 FROM users WHERE handle = ?", h); i++) h = `${clean}${i}`;
  return h;
}

export async function upsertUser(p: Profile) {
  const col = p.provider === "github" ? "github_id" : "google_id";
  const existing = await first<{ id: string }>(`SELECT id FROM users WHERE ${col} = ?`, p.providerId);
  if (existing) {
    await run("UPDATE users SET avatar = ? WHERE id = ? AND (avatar IS NULL OR avatar NOT LIKE '/api/media/%')", p.avatar, existing.id);
    return existing.id;
  }
  const e = await env();
  const id = newId(14);
  await run(
    `INSERT INTO users (id, handle, name, avatar, ${col}, ai_credits, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id, await uniqueHandle(p.login), p.name.slice(0, 60), p.avatar, p.providerId, Number(e.FREE_AI_CREDITS || 0), now(),
  );
  return id;
}

export async function devLogin(as = "maker") {
  const client = as === "client";
  const id = await upsertUser({ provider: "github", providerId: client ? "dev-client" : "dev-local", name: client ? "Priya Client" : "Dev Maker", login: client ? "devclient" : "devmaker", avatar: null });
  await startSession(id);
}
