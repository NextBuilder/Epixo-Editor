"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bell, Bookmark, Inbox, LayoutGrid, LogOut, Menu, Moon, Settings, Sparkles, Sun, SunMoon, User, X } from "lucide-react";
import { Logo } from "./logo";
import { Avatar } from "./avatar";
import { useMe } from "./use-me";

const NAV = [
  ["/community", "Community"],
  ["/makers", "Makers"],
  ["/templates", "Templates"],
  ["/boards", "Boards"],
  ["/connect", "AI"],
  ["/docs", "Docs"],
] as const;

type Theme = "auto" | "light" | "dark";
const readTheme = (): Theme => { try { const t = localStorage.getItem("epixo.theme"); return t === "light" || t === "dark" ? t : "auto"; } catch { return "auto"; } };
function applyTheme(t: Theme) {
  try { if (t === "auto") localStorage.removeItem("epixo.theme"); else localStorage.setItem("epixo.theme", t); } catch {}
  if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
}

export function SiteHeader() {
  const path = usePathname();
  const me = useMe();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>("auto");
  const [pill, setPill] = useState({ left: 0, width: 0, show: false });
  const nav = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const on = (href: string) => path === href || path.startsWith(href + "/");
  useEffect(() => { setOpen(false); setMenu(false); }, [path]);
  useEffect(() => setTheme(readTheme()), []);
  useEffect(() => {
    const f = () => setScrolled(scrollY > 4);
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    addEventListener("pointerdown", close);
    addEventListener("keydown", esc);
    return () => { removeEventListener("pointerdown", close); removeEventListener("keydown", esc); };
  }, [menu]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);
  const place = (el: HTMLElement | null) => {
    if (!el || !nav.current) return setPill(p => ({ ...p, show: false }));
    const n = nav.current.getBoundingClientRect(), r = el.getBoundingClientRect();
    setPill({ left: r.left - n.left, width: r.width, show: true });
  };
  const toActive = () => place(nav.current?.querySelector<HTMLElement>("[data-active=true]") ?? null);
  useLayoutEffect(toActive, [path]);
  if (path.startsWith("/editor")) return null;
  const cycle = () => { const t: Theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto"; applyTheme(t); setTheme(t); };
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon;
  const user = me?.user;
  const signOut = async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/"; };

  return (
    <header data-scrolled={scrolled} className="header-shell glass sticky top-0 z-40">
      <div className="wrap flex h-[52px] items-center gap-4">
        <Link href="/" className="shrink-0 rounded-lg" aria-label="Epixo home">
          <Logo size={22} />
        </Link>
        <nav ref={nav} className="relative ml-4 hidden items-center lg:flex" aria-label="Main" onMouseLeave={toActive}>
          <span className="nav-pill" style={{ left: pill.left, width: pill.width, opacity: pill.show ? 1 : 0 }} aria-hidden />
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} data-active={on(href)} onMouseEnter={e => place(e.currentTarget)} onFocus={e => place(e.currentTarget)} className={`relative z-10 rounded-full px-3.5 py-1.5 text-[14px] transition-colors duration-300 ${on(href) ? "font-medium text-ink" : "text-graphite hover:text-ink"}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button className="btn-icon hidden sm:grid place-items-center" onClick={cycle} title={`Appearance: ${theme === "auto" ? "automatic" : theme}`} aria-label="Change appearance">
            <ThemeIcon size={17} strokeWidth={1.8} />
          </button>
          {user && (
            <Link href="/notifications" className="btn-icon relative grid place-items-center" aria-label={me?.unread ? `${me.unread} new notifications` : "Notifications"}>
              <Bell size={17} strokeWidth={1.8} />
              {(me?.unread ?? 0) > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-heart ring-2 ring-paper" />}
            </Link>
          )}
          {me === undefined ? <span className="w-9" /> : user ? (
            <div ref={menuRef} className="relative">
              <button className="flex items-center rounded-full p-1 transition-colors hover:bg-fill" onClick={() => setMenu(m => !m)} aria-expanded={menu} aria-haspopup="menu" aria-label="Your account">
                <Avatar src={user.avatar} name={user.name} size={28} />
              </button>
              {menu && (
                <div role="menu" className="scale-in absolute right-0 top-11 w-64 origin-top-right overflow-hidden rounded-2xl bg-raised p-1.5 shadow-[var(--shadow-float)]">
                  <Link href={`/u/${user.handle}`} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-fill" role="menuitem">
                    <Avatar src={user.avatar} name={user.name} size={38} />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium">{user.name}</span>
                      <span className="block truncate text-[13px] text-mist">@{user.handle}</span>
                    </span>
                  </Link>
                  <div className="divider mx-2.5 my-1" />
                  {[
                    ["/dashboard", "Your projects", LayoutGrid, 0],
                    ["/dashboard?tab=requests", "Hire requests", Inbox, me?.inbox ?? 0],
                    ["/saved", "Saved", Bookmark, 0],
                    [`/u/${user.handle}`, "Profile", User, 0],
                    ["/connect", "AI connections", Sparkles, 0],
                    ["/settings", "Settings", Settings, 0],
                  ].map(([href, label, Icon, n]) => {
                    const I = Icon as typeof User;
                    return (
                      <Link key={label as string} href={href as string} role="menuitem" className="flex h-10 items-center gap-3 rounded-xl px-2.5 text-[15px] hover:bg-fill">
                        <I size={17} strokeWidth={1.8} className="text-graphite" />
                        <span className="flex-1">{label as string}</span>
                        {(n as number) > 0 && <span className="rounded-full bg-signal px-1.5 text-[12px] font-semibold leading-5 text-white">{n as number}</span>}
                      </Link>
                    );
                  })}
                  <div className="divider mx-2.5 my-1" />
                  <button role="menuitem" onClick={signOut} className="flex h-10 w-full items-center gap-3 rounded-xl px-2.5 text-[15px] text-graphite hover:bg-fill">
                    <LogOut size={17} strokeWidth={1.8} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/login?next=${encodeURIComponent(path)}`} className="hidden px-3 text-[14px] text-graphite hover:text-ink sm:block">
              Sign in
            </Link>
          )}
          <a href="/editor" className="btn btn-primary btn-sm ml-2 hidden sm:inline-flex">Open editor</a>
          <button className="btn-icon grid place-items-center lg:hidden" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Menu">
            <span key={String(open)} className="scale-in">{open ? <X size={20} /> : <Menu size={20} />}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav className="glass fixed inset-x-0 bottom-0 top-[52px] overflow-y-auto lg:hidden" aria-label="Mobile">
          <div className="wrap menu-in py-6">
            {NAV.map(([href, label], i) => (
              <Link key={href} href={href} style={{ "--i": i } as React.CSSProperties} className={`block py-2.5 text-[28px] font-semibold tracking-tight ${on(href) ? "text-ink" : "text-ink/80"}`}>
                {label}
              </Link>
            ))}
            <div style={{ "--i": NAV.length } as React.CSSProperties} className="mt-8 flex flex-col gap-3">
              <a href="/editor" className="btn btn-primary btn-lg">Open editor</a>
              {user ? <Link href="/dashboard" className="btn btn-quiet btn-lg">Your projects</Link> : <Link href="/login" className="btn btn-quiet btn-lg">Sign in</Link>}
              <button onClick={cycle} className="btn btn-quiet btn-lg"><ThemeIcon size={18} />Appearance: {theme === "auto" ? "Automatic" : theme === "light" ? "Light" : "Dark"}</button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
