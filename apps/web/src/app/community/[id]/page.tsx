import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Repeat2, PencilLine } from "lucide-react";
import { Comments } from "@/components/comments";
import { LikeButton, OwnerTools, ReportButton, ShareButton } from "@/components/post-actions";
import { ScreenGallery } from "@/components/screen-gallery";
import { Avatar } from "@/components/site-header";
import { findBoard, timeAgo } from "@/lib/data";
import { getPost, imagesOf } from "@/lib/posts";
import { currentUser, first, isAdmin, run } from "@/lib/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).id);
  if (!p || p.hidden) return { title: "Project not found" };
  const img = imagesOf(p)[0];
  return {
    title: p.title,
    description: (p.description || `An LVGL screen for ${p.board_label} made in Epixo by ${p.name}.`).slice(0, 160),
    openGraph: { title: p.title, images: img ? [img] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const [p, user] = await Promise.all([getPost(id), currentUser().catch(() => null)]);
  const admin = await isAdmin(user);
  if (!p || (p.hidden && !admin && user?.id !== p.owner_id)) notFound();
  const isOwner = user?.id === p.owner_id;
  const [liked, origin] = await Promise.all([
    user ? first("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?", p.id, user.id) : null,
    p.remix_of ? getPost(p.remix_of) : null,
    isOwner ? null : run("UPDATE posts SET views = views + 1 WHERE id = ?", p.id).catch(() => null),
  ]);
  const images = imagesOf(p);
  const board = p.board_id ? findBoard(p.board_id) : null;
  const tags = p.tags ? p.tags.split(",").filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <nav className="text-sm text-mist" aria-label="Breadcrumb">
        <Link href="/community" className="hover:text-ink">Community</Link>
        {p.brand && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/community?brand=${encodeURIComponent(p.brand)}`} className="hover:text-ink">{p.brand}</Link>
          </>
        )}
      </nav>
      {p.hidden ? <p className="mt-4 rounded-xl bg-amber-soft px-4 py-3 text-sm text-amber">This project is hidden from the community. Only you and moderators can see it.</p> : null}

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <div>
          <ScreenGallery images={images} w={p.w} h={p.h} round={!!p.round} title={p.title} />
          {p.description && (
            <div className="mt-10">
              <h2 className="sr-only">About this project</h2>
              <p className="max-w-[68ch] whitespace-pre-wrap text-[17px] leading-relaxed text-ink">{p.description}</p>
            </div>
          )}
          <Comments postId={p.id} me={user ? { id: user.id, name: user.name, avatar: user.avatar } : null} ownerId={p.owner_id} admin={admin} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{p.title}</h1>
          <Link href={`/u/${p.handle}`} className="mt-4 flex items-center gap-3 hover:text-signal">
            <Avatar src={p.avatar} name={p.name} size={36} />
            <span>
              <span className="block font-medium">{p.name}</span>
              <span className="block text-sm text-mist">@{p.handle}, {timeAgo(p.created_at)}</span>
            </span>
          </Link>
          {p.hire_open && !isOwner ? (
            <Link href={`/u/${p.handle}#hire`} className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#E7F7EE] px-4 py-3 text-[15px] text-[#137A41] hover:bg-[#DDF3E6]">
              <span className="flex items-center gap-2 font-medium"><span className="size-2 rounded-full bg-live" />{p.name.split(" ")[0]} is available for work</span>
              <span className="font-semibold">Hire</span>
            </Link>
          ) : null}
          {origin && !origin.hidden && (
            <p className="mt-4 flex items-center gap-2 text-sm text-graphite">
              <Repeat2 size={15} />
              Remixed from <Link href={`/community/${origin.id}`} className="font-medium text-ink hover:text-signal">{origin.title}</Link> by {origin.name}
            </p>
          )}

          <div className="mt-7 flex flex-col gap-2.5">
            <a href={`/editor?remix=${p.id}`} className="btn btn-primary w-full">
              <Repeat2 size={17} />
              Remix in the editor
            </a>
            {isOwner && p.project_id && (
              <a href={`/editor?open=${p.project_id}`} className="btn btn-quiet w-full">
                <PencilLine size={17} />
                Edit your project
              </a>
            )}
            <div className="flex gap-2.5">
              <LikeButton id={p.id} likes={p.likes} liked={!!liked} signedIn={!!user} />
              <ShareButton title={p.title} />
            </div>
            <a href={`/api/posts/${p.id}/project`} className="flex items-center gap-1.5 self-start pt-1 text-sm text-graphite hover:text-ink" download>
              <Download size={15} />
              Download project file
            </a>
          </div>

          <dl className="mt-8 divide-y divide-line border-y border-line text-[15px]">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-graphite">Board</dt>
              <dd className="text-right font-medium">
                {board ? <Link href={`/boards/${board.id}`} className="hover:text-signal">{p.board_label}</Link> : p.board_label || "Custom size"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-graphite">Screen</dt>
              <dd className="font-medium tabular-nums">{p.w} × {p.h}{p.round ? ", round" : ""}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-graphite">Screens in project</dt>
              <dd className="font-medium tabular-nums">{images.length}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-graphite">Activity</dt>
              <dd className="text-right tabular-nums text-graphite">{p.views} views, {p.remixes} remixes</dd>
            </div>
          </dl>

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map(t => (
                <Link key={t} href={`/community?tag=${t}`} className="rounded-full bg-card px-3 py-1 text-sm text-graphite shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink">#{t}</Link>
              ))}
            </div>
          )}

          <OwnerTools id={p.id} isOwner={isOwner} isAdmin={admin} hidden={!!p.hidden} />
          <div className="mt-6">{!isOwner && <ReportButton id={p.id} signedIn={!!user} />}</div>
        </aside>
      </div>
    </div>
  );
}
