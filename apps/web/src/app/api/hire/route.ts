import { all, guard, json } from "@/lib/server";

export async function GET(req: Request) {
  const g = await guard(req, { auth: true });
  if (g.error) return g.error;
  const received = await all(
    `SELECT h.id, h.name, h.email, h.company, h.kind, h.budget, h.timeline, h.message, h.status, h.created_at, u.handle, u.avatar
     FROM hire_requests h JOIN users u ON u.id = h.from_user WHERE h.to_user = ? AND h.status != 'archived' ORDER BY h.created_at DESC LIMIT 200`,
    g.user!.id,
  );
  return json({ received });
}
