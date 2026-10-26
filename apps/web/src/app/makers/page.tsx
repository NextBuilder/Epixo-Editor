import type { Metadata } from "next";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Empty } from "@/components/empty";
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

  return (
    <div className="wrap pt-12 sm:pt-16">
      <h1 className="t-display">Makers</h1>
      <p className="t-lead mt-3 max-w-xl">Hire people who ship real screens. Every profile is backed by work you can open.</p>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <nav className="seg self-start" aria-label="Show">
          <Link href={href({ all: undefined })} data-on={hireOnly}>Available</Link>
          <Link href={href({ all: "1" })} data-on={!hireOnly}>Everyone</Link>
        </nav>
        <form action="/makers" className="search md:ml-auto md:w-80" role="search">
          <Search size={16} />
          <input name="q" defaultValue={q} placeholder="Name, skill or city" aria-label="Search makers" />
          {!hireOnly && <input type="hidden" name="all" value="1" />}
        </form>
      </div>
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Kind of work">
        <Link href={href({ type: undefined })} className="chip" data-on={!type}>Any work</Link>
        {HIRE_TYPES.map(t => <Link key={t} href={href({ type: t })} className="chip" data-on={type === t}>{t}</Link>)}
        {skill && <Link href={href({ skill: undefined })} className="chip" data-on>{skill} ✕</Link>}
      </div>

      {makers.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {makers.map((m, mi) => {
            const cv = covers[m.id] ?? [];
            return (
              <Link key={m.id} href={`/u/${m.handle}`} data-reveal style={{ "--i": mi % 3 } as React.CSSProperties} className="card card-hover group flex flex-col overflow-hidden">
                <div className="grid h-[132px] grid-cols-3 gap-1 p-1">
                  {[0, 1, 2].map(i => {
                    const c = cv[i];
                    let img: string | null = null;
                    try { img = c ? `/api/media/${(JSON.parse(c.images) as string[])[0]}` : null; } catch {}
                    return (
                      <div key={i} className={`flex items-center justify-center overflow-hidden bg-stage ${i === 0 ? "rounded-l-[18px]" : ""} ${i === 2 ? "rounded-r-[18px]" : ""}`}>
                        {img && (c!.round
                          ? <img src={img} alt="" className="size-[84px] rounded-full object-cover ring-[4px] ring-bezel transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                          : <img src={img} alt="" className="max-h-[86%] max-w-[86%] rounded-[3px] object-contain ring-[3px] ring-bezel transition-transform duration-700 group-hover:scale-105" loading="lazy" />)}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={m.avatar} name={m.name} size={44} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-sans text-[17px] font-semibold tracking-[-0.015em] group-hover:text-signal">{m.name}</h2>
                      <p className="truncate text-[13px] text-mist">{[m.location, `${m.posts} ${m.posts === 1 ? "project" : "projects"}`].filter(Boolean).join(" · ")}</p>
                    </div>
                    {m.hire_open && <span className="tag tag-live">Available</span>}
                  </div>
                  <p className="mt-3 line-clamp-2 text-[15px] text-graphite">{m.headline || m.bio || `@${m.handle}`}</p>
                  {m.skills.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                      {m.skills.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
                      {m.skills.length > 3 && <span className="tag">+{m.skills.length - 3}</span>}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-10">
          <Empty icon={<Users size={26} />} title="No one matches yet" body="Try a broader search. If you build screens, turn on Available for work to appear here." action={hireOnly ? ["/makers?all=1", "Show everyone"] : ["/settings#hire", "List yourself"]} />
        </div>
      )}
    </div>
  );
}
