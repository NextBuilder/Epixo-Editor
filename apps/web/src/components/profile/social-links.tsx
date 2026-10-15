import { ArrowUpRight, AtSign, Box, Briefcase, Camera, Code, Cpu, Globe, Hammer, MessageCircle, Music, Play, Wrench } from "lucide-react";
import { PLATFORMS, socialDisplay, type SocialKey } from "@/lib/profile";

const ICON: Record<SocialKey, [typeof Globe, string]> = {
  website: [Globe, "#0A6CFF"],
  youtube: [Play, "#E5322D"],
  github: [Code, "#24292F"],
  linkedin: [Briefcase, "#0A66C2"],
  x: [AtSign, "#111111"],
  instagram: [Camera, "#D6249F"],
  hackster: [Cpu, "#1FA0D7"],
  instructables: [Wrench, "#F5A623"],
  hackaday: [Hammer, "#3A3A3A"],
  printables: [Box, "#FA6831"],
  tiktok: [Music, "#111111"],
  discord: [MessageCircle, "#5865F2"],
};

export function PlatformTile({ k, size = 30 }: { k: SocialKey; size?: number }) {
  const [I, c] = ICON[k];
  return (
    <span className="grid shrink-0 place-items-center rounded-[9px] text-white" style={{ width: size, height: size, background: c }} aria-hidden>
      <I size={Math.round(size * 0.55)} strokeWidth={2.2} />
    </span>
  );
}

export function SocialLinks({ socials }: { socials: Partial<Record<SocialKey, string>> }) {
  const list = PLATFORMS.filter(p => socials[p.key]);
  if (!list.length) return null;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[20px] bg-card shadow-[inset_0_0_0_1px_var(--color-line)]">
      {list.map(p => (
        <li key={p.key}>
          <a href={socials[p.key]} target="_blank" rel="me noopener nofollow ugc" className="group flex items-center gap-3.5 px-4 py-3 transition-colors duration-300 hover:bg-paper active:bg-line">
            <span className="transition-transform duration-500 [transition-timing-function:var(--spring)] group-hover:scale-110 group-hover:-rotate-6"><PlatformTile k={p.key} /></span>
            <span className="text-[15px] font-medium">{p.label}</span>
            <span className="ml-auto min-w-0 truncate text-[15px] text-mist">{socialDisplay(p.key, socials[p.key]!)}</span>
            <ArrowUpRight size={16} className="shrink-0 text-mist transition-transform duration-500 [transition-timing-function:var(--spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
          </a>
        </li>
      ))}
    </ul>
  );
}
