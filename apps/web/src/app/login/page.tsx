import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { safeNext } from "@/lib/auth";
import { env, isProduction } from "@/lib/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const ERR: Record<string, string> = {
  "github-not-configured": "GitHub sign-in is not set up on this site yet.",
  "google-not-configured": "Google sign-in is not set up on this site yet.",
  failed: "Sign-in did not finish. Try again.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = encodeURIComponent(safeNext(sp.next ?? null));
  const e = await env();
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center px-4 pt-20 text-center">
      <Logo size={52} markOnly />
      <h1 className="mt-8 text-3xl font-semibold">Sign in to Epixo</h1>
      <p className="mt-3 text-graphite">Save projects to your account, publish to the community and use AI design.</p>
      {sp.error && <p className="mt-6 w-full rounded-xl bg-amber-soft px-4 py-3 text-sm text-amber">{ERR[sp.error] ?? ERR.failed}</p>}
      <div className="mt-8 flex w-full flex-col gap-3">
        <a href={`/api/auth/github?next=${next}`} className="btn h-12 w-full bg-ink text-white hover:bg-ink/90">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" /></svg>
          Continue with GitHub
        </a>
        <a href={`/api/auth/google?next=${next}`} className="btn btn-quiet h-12 w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8z" /><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" /><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8z" /><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" /></svg>
          Continue with Google
        </a>
        {e.DEV_LOGIN === "1" && !isProduction(e) && (
          <a href={`/api/auth/dev?next=${next}`} className="btn w-full text-graphite shadow-[inset_0_0_0_1px_var(--color-line-strong)] [border-style:dashed]">
            Local test sign-in
          </a>
        )}
      </div>
      <p className="mt-8 text-sm text-mist">
        We only read your public name and picture. By signing in you agree to the <a href="/terms" className="underline hover:text-ink">terms</a> and <a href="/privacy" className="underline hover:text-ink">privacy policy</a>.
      </p>
    </div>
  );
}
