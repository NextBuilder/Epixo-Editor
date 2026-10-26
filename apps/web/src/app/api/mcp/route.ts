import { notAllowed, serveMcp } from "@/lib/mcp-route";
import { fail } from "@/lib/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return fail("Add your Epixo connection token as a Bearer token, or use the full link from /connect.", 401);
  return serveMcp(req, auth.slice(7).trim());
}

export const GET = notAllowed;
export const DELETE = notAllowed;
