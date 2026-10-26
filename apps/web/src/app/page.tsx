import Link from "next/link";
import { ArrowRight, Cpu, HeartPulse, Layers, Sparkles, Usb, Code2 } from "@/components/icons";
import { HeroBench } from "@/components/hero-bench";
import { PostGrid } from "@/components/post-card";
import { BOARDS, BRANDS } from "@/lib/data";
import { listPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

const CHECKS = [
  ["57/57", "C on LVGL 8.4 to 9.6", "Compiled with -Werror, compared byte for byte"],
  ["57/57", "LVGL XML", "Loaded by LVGL 9.4, compared"],
  ["57/57", "ESPHome", "Passes esphome config"],
  ["56/57", "MicroPython", "Run on lv_micropython, compared"],
];

export default async function Home() {
  const posts = await listPosts({ sort: "trending", limit: 6 });
  const tiles = [
    { icon: Cpu, tint: "#0071E3", title: "Real LVGL, in the browser.", body: "The canvas is LVGL itself. What you see is what your board draws." },
    { icon: Sparkles, tint: "#BF5AF2", title: "AI that builds with you.", body: "Ask in plain words, or connect Claude and ChatGPT.", href: "/connect" },
    { icon: Layers, tint: "#FF9F0A", title: `${BOARDS.length} boards.`, body: `${BRANDS.length} makers, round and square, set up for you.`, href: "/boards" },
    { icon: HeartPulse, tint: "#FF375F", title: "Design Doctor.", body: "Finds clipped text, tiny buttons and low contrast. Fixes them in one tap." },
    { icon: Code2, tint: "#30D158", title: "Code you can read.", body: "C, MicroPython, LVGL XML, ESPHome and PlatformIO.", href: "/docs/export" },
    { icon: Usb, tint: "#64D2FF", title: "Live Mirror.", body: "Edits appear on your board over USB as you make them.", href: "/docs/live-mirror" },
  ];

  return (
    <>
      <section className="wrap pb-16 pt-16 text-center sm:pt-24">
        <div className="stagger">
          <h1 className="t-hero mx-auto max-w-[14ch]">Design it here. See it there.</h1>
          <p className="t-lead mx-auto mt-5 max-w-[30rem]" style={{ "--i": 1 } as React.CSSProperties}>
            Touch screens for ESP32 displays, designed on real LVGL and ready to flash.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3" style={{ "--i": 2 } as React.CSSProperties}>
            <a href="/editor" className="btn btn-primary btn-lg">Open the editor</a>
            <Link href="/community" className="btn btn-quiet btn-lg">Explore projects</Link>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-[980px]">
          <HeroBench />
        </div>
      </section>

      <section className="wrap py-20">
        <h2 data-reveal className="t-display max-w-[18ch]">Everything you need to ship a screen.</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t, i) => {
            const body = (
              <>
                <span className="grid size-11 place-items-center rounded-[13px] text-white" style={{ background: t.tint }}>
                  <t.icon size={22} strokeWidth={2} />
                </span>
                <h3 className="mt-10 text-[22px] leading-tight">{t.title}</h3>
                <p className="mt-2 text-[15px] text-graphite">{t.body}</p>
                {t.href && <span className="mt-4 inline-flex items-center gap-1 text-[15px] text-signal">Learn more <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" /></span>}
              </>
            );
            const cls = "card card-hover group flex min-h-[260px] flex-col p-7";
            return t.href ? (
              <Link key={t.title} href={t.href} className={cls} data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>{body}</Link>
            ) : (
              <div key={t.title} className={cls} data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>{body}</div>
            );
          })}
        </div>
      </section>

      <section className="wrap py-20">
        <div className="card overflow-hidden p-8 sm:p-12" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="t-display max-w-[16ch]">Tested on real LVGL. Every release.</h2>
              <p className="mt-4 max-w-md text-[17px] text-graphite">57 projects, every format, compared pixel for pixel with the editor.</p>
            </div>
            <Link href="/docs/verification" className="btn btn-quiet">How we test</Link>
          </div>
          <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-4">
            {CHECKS.map(([n, what, how]) => (
              <div key={what} className="bg-card p-6">
                <dd className="font-display text-[40px] font-semibold leading-none tracking-tight tabular-nums">{n}</dd>
                <dt className="mt-3 text-[15px] font-medium">{what}</dt>
                <p className="mt-1 text-[13px] text-mist">{how}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="wrap py-20">
          <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
            <h2 className="t-display">Made by makers.</h2>
            <Link href="/community" className="btn-link btn inline-flex items-center gap-1 text-[17px]">See all <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-10">
            <PostGrid posts={posts} />
          </div>
        </section>
      )}

      <section className="wrap pt-16 text-center" data-reveal>
        <h2 className="t-display mx-auto max-w-[16ch]">Your next screen starts here.</h2>
        <p className="t-lead mx-auto mt-4 max-w-md">Free, in your browser, nothing to install.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/editor" className="btn btn-primary btn-lg">Open the editor</a>
          <Link href="/docs/getting-started" className="btn btn-quiet btn-lg">Five-minute guide</Link>
        </div>
      </section>
    </>
  );
}
