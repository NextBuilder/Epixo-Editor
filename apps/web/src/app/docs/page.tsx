import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import { DOCS, DOC_GROUPS } from "@/lib/docs";

export const metadata: Metadata = { title: "Docs", description: "Guides for the Epixo LVGL editor: getting started, AI design, exporting code, board packs, Live Mirror, MicroPython, ESPHome and LVGL XML." };

export default function DocsIndex() {
  return (
    <div className="wrap-narrow pt-12 sm:pt-16">
      <h1 className="t-display">Docs</h1>
      <p className="t-lead mt-3">From an empty screen to a running board.</p>
      {DOC_GROUPS.map(g => (
        <section key={g} className="mt-10">
          <h2 className="group-title font-sans tracking-normal">{g}</h2>
          <ul className="inset-group">
            {DOCS.filter(d => d.group === g).map(d => (
              <li key={d.slug}>
                <Link href={`/docs/${d.slug}`} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-fill">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-medium">{d.title}</span>
                    <span className="block truncate text-[14px] text-mist">{d.summary}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-mist" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
