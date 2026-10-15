import type { Metadata } from "next";
import Link from "next/link";
import { DOCS, DOC_GROUPS } from "@/lib/docs";

export const metadata: Metadata = { title: "Docs", description: "Guides for the Epixo LVGL editor: getting started, exporting code, board packs, Live Mirror, MicroPython, ESPHome and LVGL XML." };

export default function DocsIndex() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-semibold sm:text-5xl">Docs</h1>
      <p className="mt-4 max-w-xl text-lg text-graphite">Short guides that get you from an empty screen to a running board.</p>
      <div className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {DOC_GROUPS.map(g => (
          <section key={g}>
            <h2 className="border-b border-line pb-3 font-sans text-sm font-semibold tracking-normal">{g}</h2>
            <ul className="mt-2">
              {DOCS.filter(d => d.group === g).map(d => (
                <li key={d.slug}>
                  <Link href={`/docs/${d.slug}`} className="group block py-3">
                    <span className="block font-medium group-hover:text-signal">{d.title}</span>
                    <span className="mt-0.5 block text-sm text-graphite">{d.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
