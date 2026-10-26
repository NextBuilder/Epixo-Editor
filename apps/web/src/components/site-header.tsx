"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { useMe } from "./use-me";

const NAV = [
  ["/community", "Community"],
  ["/makers", "Makers"],
  ["/boards", "Boards"],
  ["/templates", "Templates"],
  ["/connect", "AI"],
  ["/docs", "Docs"],
  ["/pricing", "Pricing"],
] as const;

export function SiteHeader() {
  const path = usePathname();
  const me = useMe();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pill, setPill] = useState<{ left: number; width: number; show: boolean }>({ left: 0, width: 0, show: false });
  const nav = useRef<HTMLElement>(null);
  const on = (href: string) => path === href || path.startsWith(href + "/");
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const f = () => setScrolled(scrollY > 8);
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  const place = (el: HTMLElement | null) => {
    if (!el || !nav.current) return setPill(p => ({ ...p, show: false }));
    const n = nav.current.getBoundingClientRect(), r = el.getBoundingClientRect();
    setPill({ left: r.left - n.left, width: r.width, show: true });
  };
  const toActive = () => place(nav.current?.querySelector<HTMLElement>("[data-active=true]") ?? null);
  useLayoutEffect(toActive, [path]);
  if (path.startsWith("/editor")) return null;

  return (
    <header data-scrolled={scrolled} className="header-shell sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Epixo home">
          <Logo />
        </Link>
        <nav ref={nav} className="relative hidden items-center gap-1 md:flex" aria-label="Main" onMouseLeave={toActive}>
          <span className="nav-pill" style={{ left: pill.left, width: pill.width, opacity: pill.show ? 1 : 0 }} aria-hidden />
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} data-active={on(href)} onMouseEnter={e => place(e.currentTarget)} onFocus={e => place(e.currentTarget)} className={`relative z-10 rounded-lg px-3 py-2 text-[15px] transition-colors duration-300 ${on(href) ? "text-ink font-medium" : "text-graphite hover:text-ink"}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden min-w-[84px] justify-end sm:flex">
            {me === undefined ? null : me.user ? (
              <Link href="/dashboard" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium hover:bg-card" title="Your dashboard">
                <span className="relative">
                  <Avatar src={me.user.avatar} name={me.user.name} size={28} />
                  {(me.inbox ?? 0) > 0 && <span className="absolute -right-1 -top-1 grid min-w-[17px] place-items-center rounded-full bg-signal px-1 text-[10px] font-semibold leading-[17px] text-white ring-2 ring-paper" title="New hire requests">{me.inbox}</span>}
                </span>
                <span className="max-w-[120px] truncate">{me.user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link href={`/login?next=${encodeURIComponent(path)}`} className="btn btn-sm text-graphite hover:text-ink">
                Sign in
              </Link>
            )}
          </div>
          <a href="/editor" className="btn btn-primary btn-sm">
            Open editor
          </a>
          <button className="grid size-9 place-items-center rounded-lg text-graphite hover:bg-card md:hidden" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Menu">
            <span key={String(open)} className="scale-in">{open ? <X size={20} /> : <Menu size={20} />}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav className="menu-in border-t border-line bg-paper px-4 pb-4 pt-2 md:hidden" aria-label="Mobile">
          {NAV.map(([href, label], i) => (
            <Link key={href} href={href} style={{ "--i": i } as React.CSSProperties} className="block rounded-lg px-2 py-3 text-[17px] text-ink active:bg-card">
              {label}
            </Link>
          ))}
          <Link href={me?.user ? "/dashboard" : "/login"} style={{ "--i": NAV.length } as React.CSSProperties} className="block rounded-lg px-2 py-3 text-[17px] text-signal">
            {me?.user ? "Your dashboard" : "Sign in"}
          </Link>
        </nav>
      )}
    </header>
  );
}

export function Avatar({ src, name, size = 32 }: { src: string | null | undefined; name: string; size?: number }) {
  if (src) return <img src={src} alt="" width={size} height={size} className="rounded-full bg-line object-cover" style={{ width: size, height: size }} referrerPolicy="no-referrer" />;
  const hue = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue} 55% 48%)` }} aria-hidden>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
