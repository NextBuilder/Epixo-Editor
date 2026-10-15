"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { SOCIAL } from "@/lib/data";

const COLS = [
  ["Product", [["/editor", "Editor"], ["/templates", "Templates"], ["/boards", "Boards"], ["/pricing", "Pricing"]]],
  ["Community", [["/community", "Projects"], ["/community?sort=new", "Newest"], ["/dashboard", "Your projects"]]],
  ["Learn", [["/docs/getting-started", "Getting started"], ["/docs/export", "Exporting code"], ["/docs/live-mirror", "Live Mirror"], ["/docs/faq", "FAQ"]]],
] as const;

export function SiteFooter() {
  const path = usePathname();
  if (path.startsWith("/editor")) return null;
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[15px] text-graphite">An LVGL UI editor that runs LVGL itself, made by Next Builder for makers who ship real hardware.</p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {SOCIAL.map(([n, href]) => (
              <a key={n} href={href} target="_blank" rel="noopener" className="text-graphite hover:text-signal">
                {n}
              </a>
            ))}
          </div>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title}>
            <h2 className="font-sans text-sm font-semibold tracking-normal text-ink">{title}</h2>
            <ul className="mt-3 space-y-2">
              {links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[15px] text-graphite hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-mist sm:px-6">
          <span>© {new Date().getFullYear()} Next Builder. LVGL is MIT-licensed and not affiliated with Epixo.</span>
          <span className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
