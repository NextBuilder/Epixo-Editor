import { ArrowUpRight } from "@/components/icons";
import { BrandTile } from "@/components/brand";
import { PLATFORMS, socialDisplay, type SocialKey } from "@/lib/profile";

export { BrandTile as PlatformTile };

export function SocialLinks({ socials }: { socials: Partial<Record<SocialKey, string>> }) {
  const list = PLATFORMS.filter(p => socials[p.key]);
  if (!list.length) return null;
  return (
    <ul className="inset-group">
      {list.map(p => (
        <li key={p.key}>
          <a href={socials[p.key]} target="_blank" rel="me noopener nofollow ugc" className="group flex min-h-[52px] items-center gap-3.5 px-4 transition-colors duration-200 hover:bg-fill active:bg-fill-strong">
            <BrandTile k={p.key} />
            <span className="text-[16px]">{p.label}</span>
            <span className="ml-auto min-w-0 truncate text-[15px] text-mist">{socialDisplay(p.key, socials[p.key]!)}</span>
            <ArrowUpRight size={15} weight="bold" className="shrink-0 text-mist transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
