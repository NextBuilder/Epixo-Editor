import { endSession, fail, json, sameOrigin } from "@/lib/server";

export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return fail("Cross-site request blocked", 403);
  await endSession();
  return json({ ok: true });
}
