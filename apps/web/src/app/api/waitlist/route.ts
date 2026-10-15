import { z } from "zod";
import { fail, guard, json, now, run } from "@/lib/server";

export async function POST(req: Request) {
  const g = await guard(req, { rate: ["waitlist", 5, 600] });
  if (g.error) return g.error;
  const p = z.object({ email: z.string().trim().toLowerCase().email().max(200) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("Enter a valid email address.");
  await run("INSERT INTO waitlist (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING", p.data.email, now());
  return json({ ok: true });
}
