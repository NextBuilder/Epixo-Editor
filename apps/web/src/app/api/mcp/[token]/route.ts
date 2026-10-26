import { notAllowed, serveMcp } from "@/lib/mcp-route";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: Request, ctx: Ctx) {
  return serveMcp(req, (await ctx.params).token);
}

export const GET = notAllowed;
export const DELETE = notAllowed;
