// Real brand marks for social links, from Simple Icons (CC0), on iOS-style rounded tiles.
import { siBehance, siBluesky, siBuymeacoffee, siDiscord, siDribbble, siFacebook, siGithub, siGitlab, siHackaday, siHackster, siInstagram, siInstructables, siKofi, siLinktree, siMastodon, siMedium, siPatreon, siPinterest, siPrintables, siReddit, siSubstack, siTelegram, siThingiverse, siThreads, siTiktok, siTwitch, siWhatsapp, siX, siYoutube } from "simple-icons";
import type { SocialKey } from "@/lib/profile";

type Mark = { path: string; hex: string };
const LINKEDIN = "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z";
const GLOBE = "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14a8.2 8.2 0 0 1 0-4h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.07 16zm2.95-8H5.07a7.99 7.99 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.02 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38a8.2 8.2 0 0 1 0 4h-3.38z";

const MARKS: Record<SocialKey, Mark> = {
  website: { path: GLOBE, hex: "0071E3" }, linkedin: { path: LINKEDIN, hex: "0A66C2" },
  x: siX, instagram: siInstagram, facebook: siFacebook, threads: siThreads, bluesky: siBluesky, mastodon: siMastodon, reddit: siReddit,
  youtube: siYoutube, tiktok: siTiktok, twitch: siTwitch, discord: siDiscord, telegram: siTelegram, whatsapp: siWhatsapp,
  github: siGithub, gitlab: siGitlab, hackster: siHackster, instructables: siInstructables, hackaday: siHackaday, printables: siPrintables, thingiverse: siThingiverse,
  medium: siMedium, substack: siSubstack, behance: siBehance, dribbble: siDribbble, pinterest: siPinterest,
  patreon: siPatreon, kofi: siKofi, buymeacoffee: siBuymeacoffee, linktree: siLinktree,
};

const light = (hex: string) => {
  const n = parseInt(hex, 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 186;
};

// Instagram keeps its gradient; near-black brands use the system's neutral tile so they read in dark mode too.
export function BrandTile({ k, size = 30 }: { k: SocialKey; size?: number }) {
  const m = MARKS[k];
  const dark = /^(000000|181717|1A1A1A|111111)$/i.test(m.hex);
  const bg = k === "instagram" ? "radial-gradient(circle at 30% 107%, #FDF497 0%, #FD5949 45%, #D6249F 60%, #285AEB 90%)" : dark ? "var(--brand-neutral)" : `#${m.hex}`;
  const fg = !dark && light(m.hex) ? "#1D1D1F" : "#FFFFFF";
  return (
    <span className="grid shrink-0 place-items-center" style={{ width: size, height: size, borderRadius: Math.round(size * 0.24), background: bg }} aria-hidden>
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.56)} height={Math.round(size * 0.56)} fill={fg}><path d={m.path} /></svg>
    </span>
  );
}

export function BrandGlyph({ k, size = 18, className = "" }: { k: SocialKey; size?: number; className?: string }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden><path d={MARKS[k].path} /></svg>;
}
