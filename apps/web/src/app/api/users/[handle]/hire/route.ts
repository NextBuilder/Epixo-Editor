import { z } from "zod";
import { fail, first, guard, json, newId, now, run } from "@/lib/server";
import { HIRE_TYPES } from "@/lib/profile";
import { notify } from "@/lib/notify";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  company: z.string().trim().max(80).default(""),
  kind: z.string().trim().max(40).default(""),
  budget: z.string().trim().max(60).default(""),
  timeline: z.string().trim().max(60).default(""),
  message: z.string().trim().min(20).max(3000),
});

export async function POST(req: Request, ctx: { params: Promise<{ handle: string }> }) {
  const { handle } = await ctx.params;
  const g = await guard(req, { auth: true, rate: ["hire", 6, 3600] });
  if (g.error) return g.error;
  const target = await first<{ id: string; hire_open: number }>("SELECT id, hire_open FROM users WHERE handle = ?", handle.toLowerCase());
  if (!target) return fail("Maker not found", 404);
  if (target.id === g.user!.id) return fail("You cannot send a request to yourself.");
  if (!target.hire_open) return fail("This maker is not taking requests right now.");
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) {
    const f = p.error.issues[0]?.path[0];
    return fail(f === "email" ? "Enter an email address they can reply to." : f === "message" ? "Describe the work in at least 20 characters." : f === "name" ? "Add your name." : "Check the form and try again.");
  }
  const recent = await first<{ n: number }>("SELECT COUNT(*) AS n FROM hire_requests WHERE from_user = ? AND to_user = ? AND created_at > ?", g.user!.id, target.id, now() - 86400);
  if ((recent?.n ?? 0) >= 2) return fail("You already sent this maker a request today. Give them time to reply.", 429);
  const d = p.data;
  const kind = (HIRE_TYPES as readonly string[]).includes(d.kind) ? d.kind : "";
  await run(
    "INSERT INTO hire_requests (id, to_user, from_user, name, email, company, kind, budget, timeline, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    newId(14), target.id, g.user!.id, d.name, d.email, d.company, kind, d.budget, d.timeline, d.message, now(),
  );
  await notify(target.id, g.user!.id, "hire", null, d.kind || "New project");
  return json({ ok: true });
}
