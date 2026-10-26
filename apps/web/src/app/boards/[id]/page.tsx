import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
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
    <div className="wrap pt-6">
      <Link href={`/boards#${b.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="inline-flex items-center gap-0.5 text-[15px] text-signal hover:underline"><ChevronLeft size={18} />Boards</Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start">
        <div className="order-2 lg:order-1">
          <div className="stage flex items-center justify-center rounded-[28px] px-6 py-14 sm:px-14">
            <TemplateStill board={lv} template={picks[0]} width={b.round ? "62%" : wide ? "100%" : `${Math.min(70, (b.w / b.h) * 80)}%`} />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-[15px] text-mist">{b.brand}</p>
          <h1 className="t-display mt-1">{b.name}</h1>
          <div className="mt-4" title={VERIFY[b.v]?.note}><VerifyBadge v={b.v} /></div>
          <dl className="inset-group mt-8">
            {specs.map(([k, v]) => (
              <div key={k} className="row justify-between gap-6 text-[15px]">
                <dt className="text-graphite">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`/editor?board=${b.id}`} className="btn btn-primary btn-lg">Design for this board</a>
            {b.src && (
              <a href={b.src} target="_blank" rel="noopener" className="btn btn-quiet btn-lg">
                Maker page <ExternalLink size={15} />
              </a>
            )}
          </div>
          <p className="mt-6 text-[14px] text-mist">
            {pack
              ? `Export includes a ready-to-build PlatformIO project using ${pack}, with this board's display and touch already set up.`
              : "Export gives you portable LVGL code and a generic main file. Add your board's display driver, or use the ESPHome export."}
          </p>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="t-display text-[32px]">Templates for this screen</h2>
        <div className={`mt-10 grid gap-8 ${wide ? "sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
          {picks.map(t => {
            const name = TEMPLATES.find(x => x.key === t)?.name ?? t;
            return (
              <a key={t} href={`/editor?board=${b.id}&template=${t}`} className="group block">
                <div className="stage hover-device flex items-center justify-center p-6">
                  <TemplateStill board={lv} template={t} width={b.round ? "78%" : wide ? "100%" : "80%"} />
                </div>
                <p className="mt-3 px-1 text-[15px] font-medium group-hover:text-signal">{name}</p>
              </a>
            );
          })}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="mt-20">
          <h2 className="t-display text-[32px]">Made for this board</h2>
          <div className="mt-10">
            <PostGrid posts={posts} />
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="group-title font-sans tracking-normal">Same {b.w} × {b.h} screen</h2>
          <ul className="inset-group">
            {similar.map(s => (
              <li key={s.id}>
                <Link href={`/boards/${s.id}`} className="flex items-center gap-4 px-4 py-3 text-[15px] transition-colors hover:bg-fill">
                  <Shape w={s.w} h={s.h} round={s.round} />
                  <span className="truncate">{s.brand} {s.name}</span>
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
