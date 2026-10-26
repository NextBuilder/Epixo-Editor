import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, LayoutGrid, MapPin, Pin, Wallet } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { Avatar, tone } from "@/components/avatar";
import { Empty } from "@/components/empty";
import { ShareButton } from "@/components/post-actions";
import { FollowButton } from "@/components/profile/follow-button";
import { HireButton } from "@/components/profile/hire-sheet";
import { SocialLinks } from "@/components/profile/social-links";
import { Device, deviceWidth } from "@/components/device";
import { CountUp, FadeImg } from "@/components/motion/motion";
import { findBoard } from "@/lib/data";
import { getMaker, makerBoards } from "@/lib/makers";
import { imagesOf, listPosts, type PostRow } from "@/lib/posts";
import { currentUser, first } from "@/lib/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await getMaker((await params).handle);
  if (!m) return { title: "Maker not found" };
  const desc = m.headline || m.bio || `LVGL projects by ${m.name} on Epixo.`;
  return { title: `${m.name} (@${m.handle})`, description: desc.slice(0, 160), openGraph: { title: `${m.name} on Epixo`, description: desc.slice(0, 160) } };
}

export default async function ProfilePage({ params }: Props) {
  const m = await getMaker((await params).handle);
  if (!m) notFound();
  const [posts, me, boards] = await Promise.all([listPosts({ owner: m.id, sort: "new", limit: 60 }), currentUser().catch(() => null), makerBoards(m.id)]);
  const isMe = me?.id === m.id;
  const following = me && !isMe ? !!(await first("SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?", me.id, m.id).catch(() => null)) : false;
  const pinned = posts.find(p => p.id === m.pinned_post) ?? null;
  const rest = posts.filter(p => p.id !== pinned?.id);
  const [a, b] = tone(m.name);
  const since = new Date(m.created_at * 1000).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const firstName = m.name.split(" ")[0];
  const ld = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@type": "Person", name: m.name, alternateName: "@" + m.handle, description: m.headline || m.bio || undefined, homeLocation: m.location || undefined, knowsAbout: m.skills, sameAs: Object.values(m.socials) },
  };
  const stats: [string, number][] = [["Projects", m.posts], ["Likes", m.likes], ["Followers", m.followers], ["Following", m.following]];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[340px] opacity-[0.22]" style={{ background: `radial-gradient(50% 80% at 30% 0%, ${a}, transparent 70%), radial-gradient(50% 80% at 70% 0%, ${b}, transparent 70%)` }} />
        <div className="wrap relative pt-14 text-center">
          <div className="scale-in mx-auto w-fit rounded-full p-1 ring-1 ring-line">
            <Avatar src={m.avatar} name={m.name} size={112} />
          </div>
          <div className="stagger" style={{ "--d": "120ms" } as React.CSSProperties}>
            <h1 className="t-display mt-5">{m.name}</h1>
            {m.headline && <p className="t-lead mx-auto mt-2 max-w-xl">{m.headline}</p>}
            <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[15px] text-mist">
              <span>@{m.handle}</span>
              {m.location && <span className="flex items-center gap-1"><MapPin size={15} />{m.location}</span>}
              <span>Since {since}</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {isMe ? (
                <>
                  <Link href="/settings" className="btn btn-quiet">Edit profile</Link>
                  <ShareButton title={`${m.name} on Epixo`} />
                </>
              ) : (
                <>
                  {m.hire_open && <HireButton handle={m.handle} name={m.name} types={m.hire_types} signedIn={!!me} />}
                  <FollowButton handle={m.handle} following={following} followers={m.followers} signedIn={!!me} />
                  <ShareButton title={`${m.name} on Epixo`} />
                </>
              )}
            </div>
            <dl className="mx-auto mt-9 flex max-w-lg justify-center divide-x divide-line">
              {stats.map(([k, v]) => (
                <div key={k} className="flex-1 px-3">
                  <dd className="font-display text-[24px] font-semibold tabular-nums tracking-tight"><CountUp value={v} /></dd>
                  <dt className="text-[13px] text-mist">{k}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="wrap mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="order-2 min-w-0 lg:order-1">
          {pinned && <PinnedProject p={pinned} />}
          {rest.length > 0 ? (
            <div className={`${pinned ? "mt-10" : ""} grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-9 sm:grid-cols-2`}>
              {rest.map((p, i) => <PostCard key={p.id} p={p} i={i} />)}
            </div>
          ) : !pinned ? (
            <Empty icon={<LayoutGrid size={26} />} title={isMe ? "Your work will live here" : "No projects yet"} body={isMe ? "Publish from the editor and it appears on your profile." : `${firstName} has not published anything yet.`} action={isMe ? ["/editor", "Open the editor"] : undefined} />
          ) : null}
        </div>

        <aside className="order-1 min-w-0 space-y-7 lg:order-2">
          {m.hire_open && (
            <section id="hire" className="card scroll-mt-24 overflow-hidden p-5" data-reveal>
              <p className="flex items-center gap-2 text-[13px] font-medium text-live"><span className="size-2 rounded-full bg-live" />Available for work</p>
              <h2 className="mt-2 text-[20px]">Work with {firstName}</h2>
              {m.hire_note && <p className="mt-1.5 whitespace-pre-wrap text-[15px] text-graphite">{m.hire_note}</p>}
              {(m.hire_types.length > 0 || m.hire_rate) && (
                <ul className="mt-4 space-y-2 text-[15px]">
                  {m.hire_types.length > 0 && <li className="flex gap-2.5"><Clock size={17} className="mt-0.5 shrink-0 text-mist" />{m.hire_types.join(", ")}</li>}
                  {m.hire_rate && <li className="flex gap-2.5"><Wallet size={17} className="mt-0.5 shrink-0 text-mist" />{m.hire_rate}</li>}
                </ul>
              )}
              {!isMe && <div className="mt-5"><HireButton handle={m.handle} name={m.name} types={m.hire_types} signedIn={!!me} full label="Send a request" /></div>}
            </section>
          )}

          {(m.bio || m.skills.length > 0) && (
            <section data-reveal>
              <h2 className="group-title font-sans tracking-normal">About</h2>
              <div className="card p-5">
                {m.bio && <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.bio}</p>}
                {m.skills.length > 0 && (
                  <div className={`${m.bio ? "mt-4" : ""} flex flex-wrap gap-1.5`}>
                    {m.skills.map(s => <Link key={s} href={`/makers?all=1&skill=${encodeURIComponent(s)}`} className="chip h-8 text-[13px]">{s}</Link>)}
                  </div>
                )}
              </div>
            </section>
          )}

          {Object.keys(m.socials).length > 0 && (
            <section data-reveal>
              <h2 className="group-title font-sans tracking-normal">Elsewhere</h2>
              <SocialLinks socials={m.socials} />
            </section>
          )}

          {boards.length > 0 && (
            <section data-reveal>
              <h2 className="group-title font-sans tracking-normal">Builds for</h2>
              <div className="inset-group">
                {boards.map(b => {
                  const bd = b.board_id ? findBoard(b.board_id) : null;
                  return (
                    <div key={b.board_label} className="row justify-between text-[15px]">
                      {bd ? <Link href={`/boards/${bd.id}`} className="truncate hover:text-signal">{b.board_label}</Link> : <span className="truncate">{b.board_label}</span>}
                      <span className="shrink-0 tabular-nums text-mist">{b.n}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {isMe && !m.hire_open && (
            <Link href="/settings#hire" className="card card-hover block p-5">
              <p className="font-medium">Let people hire you</p>
              <p className="mt-1 text-[15px] text-graphite">Turn on Available for work to get project requests.</p>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function PinnedProject({ p }: { p: PostRow }) {
  const img = imagesOf(p)[0];
  return (
    <Link data-reveal href={`/community/${p.id}`} className="group block">
      <div className="stage hover-device flex aspect-[16/9] items-center justify-center overflow-hidden">
        <Device w={p.w} h={p.h} round={!!p.round} width={deviceWidth(p.w, p.h, !!p.round, 0.9)}>
          {img && <FadeImg src={img} className="block size-full object-cover" />}
        </Device>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-mist"><Pin size={13} />Pinned</p>
      <h3 className="mt-1 text-[22px] group-hover:text-signal">{p.title}</h3>
    </Link>
  );
}
