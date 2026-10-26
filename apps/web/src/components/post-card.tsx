import Link from "next/link";
import { Heart, MessageCircle } from "@/components/icons";
import { Device, deviceWidth } from "./device";
import { Avatar } from "./avatar";
import { firstImage, type PostRow } from "@/lib/posts";
import { FadeImg } from "./motion/motion";

export function PostCard({ p, i = 0 }: { p: PostRow; i?: number }) {
  const img = firstImage(p);
  return (
    <article className="group" data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
      <Link href={`/community/${p.id}`} className="press stage block overflow-hidden" aria-label={p.title}>
        <div className="hover-device flex aspect-[4/3] items-center justify-center">
          <Device w={p.w} h={p.h} round={!!p.round} width={deviceWidth(p.w, p.h, !!p.round)}>
            {img ? <FadeImg src={img} className="block size-full object-cover" loading="lazy" /> : null}
          </Device>
        </div>
      </Link>
      <div className="mt-3.5 flex items-start gap-3 px-1">
        <Link href={`/u/${p.handle}`} className="mt-0.5 shrink-0" aria-label={p.name}>
          <Avatar src={p.avatar} name={p.name} size={30} />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-sans text-[15px] font-semibold leading-snug tracking-[-0.01em]">
            <Link href={`/community/${p.id}`} className="hover:text-signal">{p.title}</Link>
          </h3>
          <p className="truncate text-[13px] text-mist">
            <Link href={`/u/${p.handle}`} className="text-graphite hover:text-ink">{p.name}</Link>
            {p.brand ? ` · ${p.brand}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 pt-0.5 text-[13px] tabular-nums text-mist">
          <span className="flex items-center gap-1" title="Likes"><Heart size={14} strokeWidth={2} />{p.likes}</span>
          {p.comments > 0 && <span className="flex items-center gap-1" title="Comments"><MessageCircle size={14} strokeWidth={2} />{p.comments}</span>}
        </div>
      </div>
    </article>
  );
}

export function PostGrid({ posts }: { posts: PostRow[] }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p, i) => <PostCard key={p.id} p={p} i={i} />)}
    </div>
  );
}
