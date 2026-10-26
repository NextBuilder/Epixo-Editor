import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, PencilLine, Repeat2 } from "lucide-react";
import { Comments } from "@/components/comments";
import { LikeButton, OwnerTools, ReportButton, SaveButton, ShareButton } from "@/components/post-actions";
import { FollowButton } from "@/components/profile/follow-button";
import { ScreenGallery } from "@/components/screen-gallery";
import { Avatar } from "@/components/avatar";
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
  const [liked, saved, follows, origin] = await Promise.all([
    user ? first("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?", p.id, user.id) : null,
    user ? first("SELECT 1 FROM saves WHERE post_id = ? AND user_id = ?", p.id, user.id).catch(() => null) : null,
    user && !isOwner ? first("SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?", user.id, p.owner_id) : null,
    p.remix_of ? getPost(p.remix_of) : null,
    isOwner ? null : run("UPDATE posts SET views = views + 1 WHERE id = ?", p.id).catch(() => null),
  ]);
  const images = imagesOf(p);
  const board = p.board_id ? findBoard(p.board_id) : null;
  const tags = p.tags ? p.tags.split(",").filter(Boolean) : [];
  const facts: [string, React.ReactNode][] = [
    ["Board", board ? <Link href={`/boards/${board.id}`} className="text-signal hover:underline">{p.board_label}</Link> : p.board_label || "Custom size"],
    ["Resolution", `${p.w} × ${p.h}${p.round ? ", round" : ""}`],
    ["Screens", images.length],
    ["Views", p.views.toLocaleString("en-GB")],
    ["Remixes", p.remixes],
  ];

  return (
    <div className="wrap pt-6">
      <Link href="/community" className="inline-flex items-center gap-0.5 text-[15px] text-signal hover:underline"><ChevronLeft size={18} />Community</Link>
      {p.hidden ? <p className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-[15px] text-amber">Hidden from the community. Only you and moderators can see it.</p> : null}

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-14">
        <div className="min-w-0">
          <ScreenGallery images={images} w={p.w} h={p.h} round={!!p.round} title={p.title} />
          <div className="hidden lg:block">
            {p.description && <p className="mt-10 max-w-[64ch] whitespace-pre-wrap text-[17px] leading-relaxed">{p.description}</p>}
            <Comments postId={p.id} me={user ? { id: user.id, name: user.name, avatar: user.avatar } : null} ownerId={p.owner_id} admin={admin} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <h1 className="text-[32px] leading-tight sm:text-[40px]">{p.title}</h1>
          <div className="mt-5 flex items-center gap-3">
            <Link href={`/u/${p.handle}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar src={p.avatar} name={p.name} size={40} />
              <span className="min-w-0">
                <span className="block truncate font-medium hover:text-signal">{p.name}</span>
                <span className="block truncate text-[13px] text-mist">{timeAgo(p.created_at)}</span>
              </span>
            </Link>
            {!isOwner && <FollowButton handle={p.handle} following={!!follows} signedIn={!!user} small />}
          </div>
          {origin && !origin.hidden && (
            <p className="mt-4 flex items-center gap-2 text-[14px] text-graphite">
              <Repeat2 size={15} />
              Remix of <Link href={`/community/${origin.id}`} className="font-medium text-ink hover:text-signal">{origin.title}</Link>
            </p>
          )}

          <div className="mt-7 flex flex-col gap-2.5">
            <a href={`/editor?remix=${p.id}`} className="btn btn-primary btn-lg w-full"><Repeat2 size={18} />Remix in the editor</a>
            {isOwner && p.project_id && <a href={`/editor?open=${p.project_id}`} className="btn btn-quiet btn-lg w-full"><PencilLine size={17} />Edit</a>}
            <div className="flex gap-2">
              <LikeButton id={p.id} likes={p.likes} liked={!!liked} signedIn={!!user} />
              <SaveButton id={p.id} saved={!!saved} signedIn={!!user} />
              <ShareButton title={p.title} className="flex-1" />
            </div>
          </div>

          {p.hire_open && !isOwner ? (
            <Link href={`/u/${p.handle}#hire`} className="card card-hover mt-5 flex items-center gap-3 p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-live-soft text-live"><span className="size-2.5 rounded-full bg-live" /></span>
              <span className="flex-1">
                <span className="block text-[15px] font-medium">{p.name.split(" ")[0]} is available for work</span>
                <span className="block text-[13px] text-mist">Send a project request</span>
              </span>
              <span className="text-[15px] text-signal">Hire</span>
            </Link>
          ) : null}

          <div className="inset-group mt-6">
            {facts.map(([k, v]) => (
              <div key={k} className="row justify-between text-[15px]"><span className="text-graphite">{k}</span><span className="min-w-0 truncate text-right tabular-nums">{v}</span></div>
            ))}
          </div>

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map(t => <Link key={t} href={`/community?tag=${t}`} className="chip h-8">#{t}</Link>)}
            </div>
          )}

          <div className="mt-6 flex items-center gap-5 text-[14px]">
            <a href={`/api/posts/${p.id}/project`} className="flex items-center gap-1.5 text-graphite hover:text-ink" download><Download size={15} />Project file</a>
            {!isOwner && <ReportButton id={p.id} signedIn={!!user} />}
          </div>
          <OwnerTools id={p.id} isOwner={isOwner} isAdmin={admin} hidden={!!p.hidden} />
        </aside>

        <div className="lg:hidden">
          {p.description && <p className="whitespace-pre-wrap text-[17px] leading-relaxed">{p.description}</p>}
          <Comments postId={p.id} me={user ? { id: user.id, name: user.name, avatar: user.avatar } : null} ownerId={p.owner_id} admin={admin} />
        </div>
      </div>
    </div>
  );
}
