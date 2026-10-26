import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { HeroBench } from "@/components/hero-bench";
import { FirmwareCode, HomeBento } from "@/components/home-bento";
import { PostGrid } from "@/components/post-card";
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

  return (
    <>
      <section className="wrap pb-16 pt-16 text-center sm:pt-24">
        <div className="stagger">
          <p className="text-[19px] font-semibold tracking-[-0.02em] text-signal sm:text-[21px]">Epixo</p>
          <h1 className="t-hero mx-auto mt-2 max-w-[14ch]">Design it here. See it there.</h1>
          <p className="t-lead mx-auto mt-5 max-w-[30rem]" style={{ "--i": 1 } as React.CSSProperties}>
            Touch screens for ESP32 displays, designed on real LVGL and ready to flash.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3" style={{ "--i": 2 } as React.CSSProperties}>
            <a href="/editor" className="btn btn-primary btn-lg">Open the editor</a>
            <Link href="/community" className="btn btn-link btn-lg inline-flex items-center gap-1">Explore projects <ArrowRight size={17} /></Link>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-[980px]">
          <HeroBench />
        </div>
      </section>

      <section className="wrap py-20 sm:py-28">
        <h2 data-reveal className="t-display max-w-[20ch]">Everything you need. Nothing you don&apos;t.</h2>
        <div className="mt-12"><HomeBento /></div>
      </section>

      <section className="section-dark py-24 sm:py-32">
        <div className="wrap">
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
            <div data-reveal>
              <p className="text-[17px] font-semibold text-[#2997FF]">Ready for real products</p>
              <h2 className="t-display mt-3 max-w-[14ch]">Your screen. Your firmware.</h2>
              <p className="mt-5 max-w-md text-[19px] leading-relaxed text-[#A1A1A6]">Name an action on any button, switch or slider. Epixo writes the hook, and you write one function. New exports never touch your code.</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {["LVGL C", "MicroPython", "LVGL XML", "ESPHome", "PlatformIO", "Arduino"].map(f => <li key={f} className="rounded-full bg-white/10 px-3.5 py-1.5 text-[14px] text-[#F5F5F7]">{f}</li>)}
              </ul>
              <Link href="/docs/firmware" className="mt-8 inline-flex items-center gap-1 text-[17px] text-[#2997FF] hover:underline">Connect your firmware <ArrowRight size={16} /></Link>
            </div>
            <div data-reveal style={{ "--i": 1 } as React.CSSProperties}><FirmwareCode /></div>
          </div>
          <dl className="mt-20 grid gap-y-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
            {CHECKS.map(([n, what, how]) => (
              <div key={what} className="pr-6">
                <dd className="font-display text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{n}</dd>
                <dt className="mt-3 text-[15px] font-medium text-[#F5F5F7]">{what}</dt>
                <p className="mt-1 text-[13px] text-[#86868B]">{how}</p>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-[15px] text-[#86868B]">Every export is compiled and compared pixel for pixel with the editor before each release. <Link href="/docs/verification" className="text-[#2997FF] hover:underline">How we test</Link></p>
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
