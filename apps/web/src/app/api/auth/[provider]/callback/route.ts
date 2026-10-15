import { redirect } from "next/navigation";
import { finishOAuth, safeNext, type Provider } from "@/lib/auth";

export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const q = new URL(req.url).searchParams;
  const code = q.get("code"), state = q.get("state");
  if ((provider !== "github" && provider !== "google") || !code || !state) redirect("/login?error=failed");
  let next: string | null = null;
  try {
    next = await finishOAuth(provider as Provider, code, state);
  } catch {
    next = null;
  }
  if (!next) redirect("/login?error=failed");
  redirect(safeNext(next));
}
