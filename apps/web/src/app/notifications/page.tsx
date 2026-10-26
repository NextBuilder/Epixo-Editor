import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Briefcase, Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Empty } from "@/components/empty";
import { MarkSeen } from "@/components/mark-seen";
import { timeAgo } from "@/lib/data";
import { listNotes, type Note } from "@/lib/notify";
import { currentUser } from "@/lib/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

const KIND = {
  like: { icon: Heart, color: "#FF2D55", text: "liked" },
  comment: { icon: MessageCircle, color: "#0A84FF", text: "commented on" },
  follow: { icon: UserPlus, color: "#5E5CE6", text: "started following you" },
  hire: { icon: Briefcase, color: "#30D158", text: "sent you a project request" },
  remix: { icon: Repeat2, color: "#FF9F0A", text: "remixed your project into" },
} as const;

function link(n: Note) {
  if (n.kind === "hire") return "/dashboard?tab=requests";
  if (n.kind === "follow") return n.handle ? `/u/${n.handle}` : "/notifications";
  return n.post_id ? `/community/${n.post_id}` : "/notifications";
}

export default async function Notifications() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/notifications");
  const notes = await listNotes(user.id);
  const dayAgo = Math.floor(Date.now() / 1000) - 86400;
  const groups: [string, Note[]][] = [["Today", notes.filter(n => n.created_at >= dayAgo)], ["Earlier", notes.filter(n => n.created_at < dayAgo)]];

  return (
    <div className="wrap-narrow pt-12 sm:pt-16">
      <MarkSeen any={notes.some(n => !n.seen)} />
      <h1 className="t-display">Notifications</h1>
      {notes.length === 0 ? (
        <div className="mt-10"><Empty icon={<Bell size={26} />} title="You are all caught up" body="Likes, comments, new followers and hire requests show up here." /></div>
      ) : (
        groups.filter(g => g[1].length).map(([label, list]) => (
          <section key={label} className="mt-10">
            <h2 className="group-title font-sans tracking-normal">{label}</h2>
            <ul className="inset-group">
              {list.map(n => {
                const k = KIND[n.kind] ?? KIND.like;
                let thumb: string | null = null;
                try { const im = n.images ? (JSON.parse(n.images) as string[])[0] : null; thumb = im ? `/api/media/${im}` : null; } catch {}
                return (
                  <li key={n.id}>
                    <Link href={link(n)} className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-fill">
                      <span className="relative shrink-0">
                        <Avatar src={n.avatar} name={n.name ?? "Someone"} size={42} />
                        <span className="absolute -bottom-1 -right-1 grid size-[22px] place-items-center rounded-full text-white ring-[2.5px] ring-card" style={{ background: k.color }}>
                          <k.icon size={12} strokeWidth={2.6} fill={n.kind === "like" ? "currentColor" : "none"} />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1 text-[15px] leading-snug">
                        <b className="font-semibold">{n.name ?? "Someone"}</b> {k.text}
                        {n.title && n.kind !== "follow" && n.kind !== "hire" ? <> <b className="font-semibold">{n.title}</b></> : null}
                        {n.kind === "comment" && n.body ? <span className="mt-0.5 block truncate text-graphite">“{n.body}”</span> : null}
                        <span className="mt-0.5 block text-[13px] text-mist">{timeAgo(n.created_at)}</span>
                      </span>
                      {!n.seen && <span className="size-2.5 shrink-0 rounded-full bg-signal" aria-label="New" />}
                      {thumb && <img src={thumb} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover ring-2 ring-bezel" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
