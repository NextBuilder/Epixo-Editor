import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { TemplateStill } from "@/components/template-still";
import { PostGrid } from "@/components/post-card";
import { Shape, VerifyBadge } from "@/components/verify-badge";
import { BOARDS, TEMPLATES, VERIFY, findBoard, packName } from "@/lib/data";
import { listPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = findBoard((await params).id);
  if (!b) return { title: "Board not found" };
  return {
    title: `${b.brand} ${b.name} LVGL UI designer`,
    description: `Design LVGL screens for the ${b.brand} ${b.name} (${b.size} ${b.panel}, ${b.w}×${b.h}${b.round ? ", round" : ""}) in your browser and export C, MicroPython, XML or ESPHome.`,
  };
}

export default async function BoardPage({ params }: Props) {
  const b = findBoard((await params).id);
  if (!b) notFound();
  const posts = await listPosts({ board: b.id, sort: "top", limit: 6 });
  const pack = packName(b);
  const similar = BOARDS.filter(x => x.id !== b.id && x.w === b.w && x.h === b.h).slice(0, 6);
  const picks = b.round ? ["thermostat", "fitness", "home", "music"] : b.w >= b.h ? ["home", "energy", "weather", "music"] : ["lock", "settings", "music", "weather"];
  const lv = { id: b.id, name: b.name, brand: b.brand, w: b.w, h: b.h, round: b.round };
  const wide = b.w / b.h > 1.15;

  const specs: [string, React.ReactNode][] = [
    ["Screen", `${b.size} ${b.panel}${b.round ? ", round" : ""}`],
    ["Resolution", `${b.w} × ${b.h}`],
    ["Chip", b.chip],
    ["Display driver", b.lcd || "Not listed"],
    ["Touch", b.touch ? b.tp || "Yes" : "No touch"],
    ["Bus", b.bus ? b.bus.toUpperCase() : "Not listed"],
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <nav className="text-sm text-mist" aria-label="Breadcrumb">
        <Link href="/boards" className="hover:text-ink">Boards</Link>
        <span className="mx-2">/</span>
        <Link href={`/boards#${b.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-ink">{b.brand}</Link>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start">
        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,#EDEFF3,#E4E7EC)] px-6 py-12 sm:px-12">
            <TemplateStill board={lv} template={picks[0]} width={b.round ? "62%" : wide ? "100%" : `${Math.min(70, (b.w / b.h) * 80)}%`} />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-graphite">{b.brand}</p>
          <h1 className="mt-1 text-4xl font-semibold leading-[1.05] sm:text-5xl">{b.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <VerifyBadge v={b.v} />
            <span className="text-sm text-graphite">{VERIFY[b.v]?.note}</span>
          </div>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3 text-[15px]">
                <dt className="text-graphite">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`/editor?board=${b.id}`} className="btn btn-primary">Design for this board</a>
            {b.src && (
              <a href={b.src} target="_blank" rel="noopener" className="btn btn-quiet">
                Maker page <ExternalLink size={15} />
              </a>
            )}
          </div>
          <p className="mt-6 text-sm text-graphite">
            {pack
              ? `Export includes a ready-to-build PlatformIO project using ${pack}, with this board's display and touch already set up.`
              : "Export gives you portable LVGL code and a generic main file. Add your board's display driver, or use the ESPHome export."}
          </p>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold sm:text-3xl">Templates at {b.w} × {b.h}</h2>
        <p className="mt-2 max-w-2xl text-graphite">Each template lays itself out for this screen. These are rendered right now by LVGL in your browser.</p>
        <div className={`mt-10 grid gap-8 ${wide ? "sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
          {picks.map(t => {
            const name = TEMPLATES.find(x => x.key === t)?.name ?? t;
            return (
              <a key={t} href={`/editor?board=${b.id}&template=${t}`} className="group block">
                <div className="flex items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#EDEFF3,#E6E9EE)] p-6 transition-shadow group-hover:shadow-[inset_0_0_0_1px_rgb(12_18_34/0.14)]">
                  <TemplateStill board={lv} template={t} width={b.round ? "78%" : wide ? "100%" : "80%"} />
                </div>
                <p className="mt-3 px-1 font-medium group-hover:text-signal">{name}</p>
              </a>
            );
          })}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl font-semibold sm:text-3xl">Community projects for this board</h2>
          <div className="mt-10">
            <PostGrid posts={posts} />
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl font-semibold">Other boards with the same {b.w} × {b.h} screen</h2>
          <p className="mt-2 text-graphite">Same resolution, so your designs move across with little or no change.</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {similar.map(s => (
              <li key={s.id}>
                <Link href={`/boards/${s.id}`} className="flex items-center gap-4 py-3 hover:text-signal">
                  <Shape w={s.w} h={s.h} round={s.round} />
                  <span className="font-medium">{s.brand} {s.name}</span>
                  <span className="ml-auto"><VerifyBadge v={s.v} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
