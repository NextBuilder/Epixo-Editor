import type { Metadata } from "next";
import Link from "next/link";
import { Heart, LayoutGrid, MapPin, Search } from "lucide-react";
import { Avatar } from "@/components/site-header";
import { HIRE_TYPES } from "@/lib/profile";
import { listMakers, makerCovers } from "@/lib/makers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Makers",
  description: "Find and hire makers who design LVGL screens for ESP32 and other display boards. Every profile is backed by real, published projects.",
};

type SP = Promise<{ q?: string; skill?: string; type?: string; all?: string }>;

export default async function Makers({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 60);
  const skill = sp.skill?.slice(0, 30);
  const type = (HIRE_TYPES as readonly string[]).includes(sp.type ?? "") ? sp.type : undefined;
  const hireOnly = sp.all !== "1";
  const makers = await listMakers({ q, skill, type, hireOnly });
  const covers = await makerCovers(makers.map(m => m.id));
  const href = (o: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const m = { q: q || undefined, skill, type, all: hireOnly ? undefined : "1", ...o };
    for (const [k, v] of Object.entries(m)) if (v) u.set(k, v);
    const s = u.toString();
    return s ? `/makers?${s}` : "/makers";
  };
  const pill = (on: boolean) => `pill rounded-full px-3.5 py-1.5 text-sm transition-colors ${on ? "bg-ink text-white" : "bg-card text-graphite shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink"}`;

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6">
      <div className="stagger max-w-2xl">
        <h1 className="text-4xl font-semibold sm:text-5xl">Hire makers who ship real screens.</h1>
        <p className="mt-4 text-lg text-graphite">Every profile here is backed by published projects you can open in the editor. Send a request and it goes straight to the maker&apos;s inbox.</p>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-center">
        <form action="/makers" className="relative flex-1 lg:max-w-md" role="search">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
          <input name="q" defaultValue={q} className="field pl-10" placeholder="Search by name, skill or city" aria-label="Search makers" />
          {!hireOnly && <input type="hidden" name="all" value="1" />}
        </form>
        <nav className="flex gap-2 lg:ml-auto" aria-label="Show">
          <Link href={href({ all: undefined })} className={pill(hireOnly)}>Available for work</Link>
          <Link href={href({ all: "1" })} className={pill(!hireOnly)}>All makers</Link>
        </nav>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Kind of work">
        <Link href={href({ type: undefined })} className={pill(!type)}>Any work</Link>
        {HIRE_TYPES.map(t => <Link key={t} href={href({ type: t })} className={pill(type === t)}>{t}</Link>)}
      </div>
      {skill && (
        <p className="mt-4 text-sm text-graphite">
          Skill: <span className="font-medium text-ink">{skill}</span>. <Link href={href({ skill: undefined })} className="text-signal hover:underline">Clear</Link>
        </p>
      )}

      {makers.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {makers.map((m, mi) => {
            const cv = covers[m.id] ?? [];
            return (
              <Link key={m.id} href={`/u/${m.handle}`} data-reveal style={{ "--i": mi % 3 } as React.CSSProperties} className="lift group overflow-hidden rounded-[26px] bg-card shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className="grid h-[150px] grid-cols-3 gap-1.5 bg-paper p-1.5">
                  {[0, 1, 2].map(i => {
                    const c = cv[i];
                    let img: string | null = null;
                    try { img = c ? `/api/media/${(JSON.parse(c.images) as string[])[0]}` : null; } catch {}
                    return (
                      <div key={i} className={`overflow-hidden bg-[linear-gradient(160deg,#EEF0F4,#E3E6EB)] transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:scale-[1.03] ${i === 0 ? "rounded-l-[20px]" : ""} ${i === 2 ? "rounded-r-[20px]" : ""}`}>
                        {img && (c!.round ? <span className="flex h-full items-center justify-center p-3"><img src={img} alt="" className="size-[96px] shrink-0 rounded-full object-cover ring-[5px] ring-bezel" loading="lazy" /></span> : <img src={img} alt="" className="size-full object-contain p-2.5 drop-shadow-[0_6px_10px_rgb(12_18_34/0.18)]" loading="lazy" />)}
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 pb-5">
                  <div className="-mt-9 flex items-end justify-between">
                    <span className="rounded-full bg-card p-1"><Avatar src={m.avatar} name={m.name} size={64} /></span>
                    {m.hire_open && <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#E7F7EE] px-2.5 py-1 text-xs font-medium text-[#137A41]"><span className="size-1.5 rounded-full bg-live" />Available</span>}
                  </div>
                  <h2 className="mt-3 font-sans text-lg font-semibold tracking-normal group-hover:text-signal">{m.name}</h2>
                  <p className="mt-0.5 line-clamp-2 min-h-[2.75rem] text-[15px] text-graphite">{m.headline || m.bio || `@${m.handle}`}</p>
                  {m.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.skills.slice(0, 4).map(s => <span key={s} className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium shadow-[inset_0_0_0_1px_var(--color-line)]">{s}</span>)}
                      {m.skills.length > 4 && <span className="px-1 py-1 text-xs text-mist">+{m.skills.length - 4}</span>}
                    </div>
                  )}
                  <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3.5 text-sm text-mist">
                    <span className="flex items-center gap-1.5"><LayoutGrid size={14} />{m.posts} {m.posts === 1 ? "project" : "projects"}</span>
                    <span className="flex items-center gap-1.5"><Heart size={14} />{m.likes}</span>
                    {m.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{m.location}</span>}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 rounded-[24px] border border-dashed border-line-strong px-6 py-16 text-center">
          <h2 className="text-xl font-semibold">{hireOnly ? "No one matches that yet" : "No makers found"}</h2>
          <p className="mx-auto mt-2 max-w-md text-graphite">Try a broader search, or show all makers. If you build screens yourself, turn on Available for work in your profile to appear here.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/makers?all=1" className="btn btn-quiet">Show all makers</Link>
            <Link href="/settings#hire" className="btn btn-primary">List yourself</Link>
          </div>
        </div>
      )}
    </div>
  );
}
