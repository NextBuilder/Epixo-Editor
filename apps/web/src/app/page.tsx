import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { HeroBench } from "@/components/hero-bench";
import { FirmwareCode, HomeBento } from "@/components/home-bento";
import { PostGrid } from "@/components/post-card";
import { listPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

const CHECKS = [
  ["65/65", "C for LVGL 8.4, 9.2, 9.4 and 9.6", "Compiled with -Werror and compared pixel for pixel"],
  ["65/65", "LVGL XML", "Loaded by LVGL 9.4 and compared. Pictures stay in the C export"],
  ["65/65", "ESPHome", "Passes esphome config"],
  ["56/57", "MicroPython", "Run on lv_micropython. The newest widgets are not yet included"],
];

export default async function Home() {
  const posts = await listPosts({ sort: "trending", limit: 6 });

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
              <h2 className="t-display max-w-[14ch]">Your screen. Your firmware.</h2>
              <p className="mt-5 max-w-md text-[19px] leading-relaxed text-[#A1A1A6]">Name an action on any button, switch or slider. Epixo writes the hook, and you write one function. New exports never touch your code.</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {["LVGL C", "MicroPython", "LVGL XML", "ESPHome", "PlatformIO", "Arduino"].map(f => <li key={f} className="rounded-full bg-white/10 px-3.5 py-1.5 text-[14px] text-[#F5F5F7]">{f}</li>)}
              </ul>
              <Link href="/docs/firmware" className="mt-8 inline-flex items-center gap-1 text-[17px] text-[#2997FF] hover:underline">Connect your firmware <ArrowRight size={16} /></Link>
            </div>
            <div data-reveal style={{ "--i": 1 } as React.CSSProperties}><FirmwareCode /></div>
          </div>
          <div className="mt-20" data-reveal>
            <h3 className="text-[21px] font-semibold tracking-[-0.02em]">Checked against real LVGL before every release.</h3>
            <table className="mt-6 w-full text-left text-[15px]">
              <thead className="sr-only"><tr><th>Export</th><th>How it is checked</th><th>Result</th></tr></thead>
              <tbody>
                {CHECKS.map(([n, what, how]) => (
                  <tr key={what} className="border-t border-white/12">
                    <td className="py-4 pr-4 font-medium text-[#F5F5F7]">{what}</td>
                    <td className="hidden py-4 pr-4 text-[#A1A1A6] sm:table-cell">{how}</td>
                    <td className="py-4 text-right tabular-nums text-[#F5F5F7]">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/docs/verification" className="mt-6 inline-flex items-center gap-1 text-[17px] text-[#2997FF] hover:underline">How we test <ArrowRight size={16} /></Link>
          </div>
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
