"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { SOCIAL } from "@/lib/data";

const COLS = [
  ["Product", [["/editor", "Editor"], ["/templates", "Templates"], ["/boards", "Boards"], ["/connect", "AI connections"], ["/pricing", "Pricing"]]],
  ["Community", [["/community", "Projects"], ["/makers", "Makers"], ["/makers?hire=1", "Hire a maker"], ["/dashboard", "Your projects"]]],
  ["Learn", [["/docs/getting-started", "Getting started"], ["/docs/ai", "Designing with AI"], ["/docs/export", "Exporting code"], ["/docs/faq", "Questions"]]],
] as const;

export function SiteFooter() {
  const path = usePathname();
  if (path.startsWith("/editor")) return null;
  return (
    <footer className="mt-28 bg-paper text-[13px]">
      <div className="wrap">
        <div className="divider" />
        <div className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo size={20} />
            <p className="mt-4 max-w-[260px] text-graphite">Screens for ESP32 displays, designed on real LVGL.</p>
          </div>
          {COLS.map(([title, links]) => (
            <div key={title}>
              <h2 className="font-sans text-[13px] font-semibold tracking-normal text-ink">{title}</h2>
              <ul className="mt-3 space-y-2.5">
                {links.map(([href, label]) => (
                  <li key={href}><Link href={href} className="text-graphite transition-colors hover:text-ink">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6 text-mist">
          <span>© {new Date().getFullYear()} Next Builder</span>
          <span className="flex flex-wrap gap-x-5 gap-y-2">
            {SOCIAL.map(([n, href]) => <a key={n} href={href} target="_blank" rel="noopener" className="hover:text-ink">{n}</a>)}
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
