import { z } from "zod";
import { currentUser, env, fail, first, guard, json, run } from "@/lib/server";
import { HIRE_TYPES, PLATFORMS, cleanSkills, normalizeSocial, parseSocials, splitList, type SocialKey } from "@/lib/profile";

export async function GET() {
  const user = await currentUser();
  const e = await env();
  if (!user) return json({ user: null, ai: { enabled: false } });
  const inbox = await first<{ n: number }>("SELECT COUNT(*) AS n FROM hire_requests WHERE to_user = ? AND status = 'new'", user.id).catch(() => null);
  return json({
    user: {
      id: user.id, handle: user.handle, name: user.name, avatar: user.avatar, plan: user.plan, bio: user.bio ?? "",
      headline: user.headline, location: user.location, socials: parseSocials(user.socials), skills: splitList(user.skills),
      hire_open: !!user.hire_open, hire_types: splitList(user.hire_types), hire_rate: user.hire_rate, hire_note: user.hire_note, pinned_post: user.pinned_post,
    },
    inbox: inbox?.n ?? 0,
    ai: { enabled: !!e.ANTHROPIC_API_KEY, credits: user.ai_credits },
  });
}

const Patch = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  handle: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{3,20}$/).optional(),
  headline: z.string().trim().max(90).optional(),
  location: z.string().trim().max(60).optional(),
  socials: z.record(z.string(), z.string().max(200)).optional(),
  skills: z.array(z.string().max(40)).max(20).optional(),
  hire_open: z.boolean().optional(),
  hire_types: z.array(z.string()).max(HIRE_TYPES.length).optional(),
  hire_rate: z.string().trim().max(60).optional(),
  hire_note: z.string().trim().max(400).optional(),
  pinned_post: z.string().max(20).nullable().optional(),
});

const RESERVED = new Set(["admin", "epixo", "support", "help", "api", "settings", "dashboard", "login", "makers", "community", "editor", "nextbuilder-team"]);

export async function PATCH(req: Request) {
  const g = await guard(req, { auth: true, rate: ["profile", 30, 60] });
  if (g.error) return g.error;
  const p = Patch.safeParse(await req.json().catch(() => null));
  if (!p.success) {
    const f = p.error.issues[0]?.path[0];
    return fail(f === "handle" ? "Handles use 3 to 20 lowercase letters, numbers, - or _." : "Some profile fields are too long. Shorten them and try again.");
  }
  const u = g.user!, d = p.data;
  if (d.handle && d.handle !== u.handle) {
    if (RESERVED.has(d.handle)) return fail("That handle is reserved.");
    if (await first("SELECT 1 FROM users WHERE handle = ?", d.handle)) return fail("That handle is taken.");
  }
  let socials = u.socials;
  if (d.socials) {
    const out: Partial<Record<SocialKey, string>> = {};
    for (const pl of PLATFORMS) {
      const raw = d.socials[pl.key];
      if (raw === undefined) continue;
      const n = normalizeSocial(pl.key, raw);
      if (n === null) return fail(`The ${pl.label} link does not look right. Use ${pl.key === "website" || pl.key === "discord" ? "a full https link" : "your username or the full link"}.`);
      if (n) out[pl.key] = n;
    }
    socials = JSON.stringify(out);
  }
  let pinned = u.pinned_post;
  if (d.pinned_post !== undefined) {
    pinned = d.pinned_post && (await first("SELECT 1 FROM posts WHERE id = ? AND owner_id = ?", d.pinned_post, u.id)) ? d.pinned_post : null;
  }
  const types = d.hire_types ? d.hire_types.filter(t => (HIRE_TYPES as readonly string[]).includes(t)).join(",") : u.hire_types;
  await run(
    "UPDATE users SET name = ?, bio = ?, handle = ?, headline = ?, location = ?, socials = ?, skills = ?, hire_open = ?, hire_types = ?, hire_rate = ?, hire_note = ?, pinned_post = ? WHERE id = ?",
    d.name ?? u.name, d.bio ?? u.bio, d.handle ?? u.handle, d.headline ?? u.headline, d.location ?? u.location, socials,
    d.skills ? cleanSkills(d.skills) : u.skills, d.hire_open === undefined ? u.hire_open : d.hire_open ? 1 : 0, types,
    d.hire_rate ?? u.hire_rate, d.hire_note ?? u.hire_note, pinned, u.id,
  );
  return json({ ok: true, handle: d.handle ?? u.handle });
}
