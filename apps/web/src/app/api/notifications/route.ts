import { guard, json, run } from "@/lib/server";

// Marks every notification as seen.
export async function POST(req: Request) {
  const g = await guard(req, { auth: true, rate: ["notes", 30, 60] });
  if (g.error) return g.error;
  await run("UPDATE notifications SET seen = 1 WHERE user_id = ? AND seen = 0", g.user!.id);
  return json({ ok: true });
}
