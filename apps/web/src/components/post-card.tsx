import Link from "next/link";
import { Heart, Repeat2, MessageCircle } from "lucide-react";
import { Device } from "./device";
import { Avatar } from "./site-header";
import { firstImage, type PostRow } from "@/lib/posts";
import { FadeImg } from "./motion/motion";

export function PostCard({ p, i = 0 }: { p: PostRow; i?: number }) {
  const img = firstImage(p);
  const wide = p.w / p.h > 1.15;
  return (
    <article className="group relative" data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
      <Link href={`/community/${p.id}`} className="press block overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#EDEFF3,#E6E9EE)] p-6 group-hover:shadow-[inset_0_0_0_1px_rgb(12_18_34/0.14)]" aria-label={p.title}>
        <div className="hover-device flex aspect-[4/3] items-center justify-center">
          <Device w={p.w} h={p.h} round={!!p.round} width={p.round ? "62%" : wide ? "92%" : `${Math.min(62, (p.w / p.h) * 70)}%`}>
            {img ? <FadeImg src={img} className="block size-full object-cover" loading="lazy" /> : null}
          </Device>
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="truncate font-sans text-[15px] font-semibold tracking-normal">
            <Link href={`/community/${p.id}`} className="hover:text-signal">{p.title}</Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-graphite">
            <Avatar src={p.avatar} name={p.name} size={18} />
            <Link href={`/u/${p.handle}`} className="hover:text-ink">{p.name}</Link>
            <span className="text-mist">on {p.board_label || `${p.w}×${p.h}`}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-0.5 text-[13px] text-mist">
          <span className="flex items-center gap-1" title="Likes"><Heart size={14} />{p.likes}</span>
          <span className="flex items-center gap-1" title="Remixes"><Repeat2 size={14} />{p.remixes}</span>
          {p.comments > 0 && <span className="hidden items-center gap-1 sm:flex" title="Comments"><MessageCircle size={14} />{p.comments}</span>}
        </div>
      </div>
    </article>
  );
}

export function PostGrid({ posts }: { posts: PostRow[] }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p, i) => (
        <PostCard key={p.id} p={p} i={i} />
      ))}
    </div>
  );
}
