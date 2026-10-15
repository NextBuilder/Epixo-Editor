import Link from "next/link";
import { HeroBench } from "@/components/hero-bench";
import { PostGrid } from "@/components/post-card";
import { BOARDS, BRANDS, TEMPLATES } from "@/lib/data";
import { listPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

const CHECKS = [
  ["C for LVGL 8.4, 9.2, 9.4 and 9.6", "Compiled with gcc -Wall -Werror, rendered, compared byte for byte with the editor", "57 of 57 identical on every version"],
  ["LVGL XML", "Loaded by the LVGL 9.4 XML module, rendered, compared", "57 of 57 identical"],
  ["ESPHome YAML", "Validated with esphome config", "57 of 57 valid"],
  ["MicroPython", "Run on lv_micropython, rendered, compared", "57 of 57 run, 56 identical"],
];

const STEPS = [
  ["Pick your board", "Choose from 113 boards grouped by maker. Resolution, shape and touch come with it, so a round watch gets a round canvas."],
  ["Design on real LVGL", "Drag widgets onto a canvas that is LVGL itself. Fonts, padding and anti-aliasing match the device to the pixel."],
  ["Let Doctor check it", "Doctor flags text that will clip, buttons too small for a finger, low contrast and memory that will not fit, then fixes them in one click."],
  ["Export or mirror live", "Download a PlatformIO project, C, MicroPython, XML or ESPHome. Or flash Live Mirror once and watch edits land on the board over USB."],
];

export default async function Home() {
  const posts = await listPosts({ sort: "trending", limit: 6 });
  const verified = BOARDS.filter(b => b.v === "driver" || b.v === "cyd").length;
  const brands = [...BRANDS].sort((a, b) => b.count - a.count);

  return (
    <>
      <section className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:pt-20">
        <div className="stagger">
          <h1 className="text-hero font-semibold">Design LVGL screens on LVGL itself.</h1>
          <p className="mt-6 max-w-[34rem] text-lg text-graphite" style={{ "--i": 1 } as React.CSSProperties}>
            Epixo runs the real LVGL engine in your browser, so the canvas you drag on is the exact picture your board will draw. Pick one of 113 boards, export working code, and share what you make.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" style={{ "--i": 2 } as React.CSSProperties}>
            <a href="/editor" className="btn btn-primary">Open the editor</a>
            <Link href="/community" className="btn btn-quiet">See community projects</Link>
          </div>
          <p className="mt-5 text-sm text-mist" style={{ "--i": 3 } as React.CSSProperties}>Free to use. Nothing to install. Your work saves to your account.</p>
        </div>
        <HeroBench />
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div data-reveal>
            <h2 className="text-3xl font-semibold sm:text-[2.4rem] sm:leading-[1.08]">The code is checked against real LVGL before every release.</h2>
            <p className="mt-5 text-graphite">
              We build 57 test projects across 9 templates and 7 boards, export each one in every format, run it through the real tool and compare the pixels with the editor. These are the results of the last run.
            </p>
          </div>
          <div className="overflow-x-auto" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
            <table className="w-full min-w-[560px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-line-strong text-sm text-mist">
                  <th className="py-3 pr-4 font-medium">Export</th>
                  <th className="py-3 pr-4 font-medium">How it is checked</th>
                  <th className="py-3 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {CHECKS.map(([what, how, res]) => (
                  <tr key={what} className="border-b border-line align-top">
                    <td className="py-4 pr-4 font-medium">{what}</td>
                    <td className="py-4 pr-4 text-graphite">{how}</td>
                    <td className="py-4 text-ink">
                      <span className="mr-2 inline-block size-2 rounded-full bg-live align-middle" />
                      {res}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-mist">
              The one MicroPython difference is the spinner, drawn as an arc because the MicroPython binding has no spinner. Board packs and Live Mirror follow the official Espressif and esp32-smartdisplay examples and have not yet been tested on every physical board.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div data-reveal>
            <h2 className="text-3xl font-semibold sm:text-[2.4rem] sm:leading-[1.08]">Your board is probably already here.</h2>
            <p className="mt-5 text-graphite">
              {BOARDS.length} boards from {BRANDS.length} makers, from a 128-pixel AtomS3 to a 10-inch ESP32-P4. {verified} of them have resolution, display chip and touch chip taken straight from driver code.
            </p>
            <Link href="/boards" className="btn btn-quiet mt-7">Browse all boards</Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-8 sm:grid-cols-3">
            {brands.map((b, i) => (
              <li key={b.slug} className="border-b border-line" data-reveal style={{ "--i": i % 9 } as React.CSSProperties}>
                <Link href={`/boards#${b.slug}`} className="group flex items-baseline justify-between py-3.5 transition-colors hover:text-signal"><span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                  <span className="font-medium">{b.name}</span></span>
                  <span className="text-sm tabular-nums text-mist">{b.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bezel text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
          <h2 data-reveal className="max-w-2xl text-3xl font-semibold sm:text-[2.4rem] sm:leading-[1.08]">From an empty screen to a running board in four steps.</h2>
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="border-t border-white/15 pt-5" data-reveal style={{ "--i": i + 1 } as React.CSSProperties}>
                <span className="font-display text-sm font-semibold text-[#7FB2FF]">Step {i + 1}</span>
                <h3 className="mt-2 text-xl font-semibold">{t}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/65">{d}</p>
              </li>
            ))}
          </ol>
          <div data-reveal className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-8 text-[15px] text-white/70">
            <span>{TEMPLATES.length} templates that adapt to any screen shape</span>
            <span>13 widgets, every style option exported</span>
            <span>AI that designs a screen from one sentence or a sketch</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div>
            <h2 className="text-3xl font-semibold sm:text-[2.4rem] sm:leading-[1.08]">Made by makers</h2>
            <p className="mt-3 max-w-xl text-graphite">Open any project in the editor, change it for your board and publish your version. Credit goes back to the original.</p>
          </div>
          <Link href="/community" className="btn btn-quiet">See all projects</Link>
        </div>
        <div className="mt-12">
          {posts.length ? (
            <PostGrid posts={posts} />
          ) : (
            <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
              <h3 className="text-xl font-semibold">The first project here could be yours.</h3>
              <p className="mx-auto mt-2 max-w-md text-graphite">Design a screen, press Publish in the editor, and it shows up here for everyone to open and remix.</p>
              <a href="/editor" className="btn btn-primary mt-6">Start a project</a>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div data-reveal className="relative overflow-hidden rounded-[28px] bg-signal px-8 py-16 text-white sm:px-14">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-[conic-gradient(from_200deg,#7DA2FF,#C77DFF,#FF6FA0,#FFB35C,#7DA2FF)] opacity-40 blur-3xl" />
          <h2 className="relative max-w-2xl text-3xl font-semibold sm:text-[2.6rem] sm:leading-[1.06]">Open the editor and put something on your screen tonight.</h2>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <a href="/editor" className="btn bg-white text-signal hover:bg-white/90">Open the editor</a>
            <Link href="/docs/getting-started" className="btn text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.4)] hover:shadow-[inset_0_0_0_1px_#fff]">Read the 5-minute guide</Link>
          </div>
        </div>
      </section>
    </>
  );
}
