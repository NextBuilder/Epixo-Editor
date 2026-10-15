import { redirect } from "next/navigation";
import { beginOAuth, devLogin, safeNext, type Provider } from "@/lib/auth";
import { env, fail, isProduction, limit } from "@/lib/server";

export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const next = safeNext(new URL(req.url).searchParams.get("next"));
  const ip = req.headers.get("cf-connecting-ip") ?? "local";
  if (!(await limit(`login:${ip}`, 20, 600))) return fail("Too many sign-in attempts. Try again in a few minutes.", 429);
  if (provider === "dev") {
    const e = await env();
    if (e.DEV_LOGIN !== "1" || isProduction(e)) return fail("Not found", 404);
    await devLogin(new URL(req.url).searchParams.get("as") ?? "maker");
    redirect(next);
  }
  if (provider !== "github" && provider !== "google") return fail("Unknown sign-in method", 404);
  const url = await beginOAuth(provider as Provider, next);
  if (!url) redirect(`/login?error=${provider}-not-configured`);
  redirect(url);
}
