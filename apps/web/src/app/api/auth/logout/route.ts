import { currentUser, endSession, fail, json, run, sameOrigin } from "@/lib/server";

// POST /api/auth/logout signs out this browser. With ?all=1 it signs out every device.
export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return fail("Cross-site request blocked", 403);
  if (new URL(req.url).searchParams.get("all") === "1") {
    const u = await currentUser();
    if (u) await run("DELETE FROM sessions WHERE user_id = ?", u.id);
  }
  await endSession();
  return json({ ok: true });
}
