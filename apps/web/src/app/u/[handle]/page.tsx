import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Heart, MapPin, Pin, Repeat2, Wallet } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { Avatar } from "@/components/site-header";
import { ShareButton } from "@/components/post-actions";
import { FollowButton } from "@/components/profile/follow-button";
import { HireButton } from "@/components/profile/hire-sheet";
import { SocialLinks } from "@/components/profile/social-links";
import { Device } from "@/components/device";
import { CountUp, FadeImg, Tilt } from "@/components/motion/motion";
import { findBoard } from "@/lib/data";
import { getMaker, makerBoards } from "@/lib/makers";
import { firstImage, imagesOf, listPosts } from "@/lib/posts";
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
  const pinned = posts.find(p => p.id === m.pinned_post) ?? [...posts].sort((a, b) => b.likes * 3 + b.remixes * 5 - (a.likes * 3 + a.remixes * 5))[0];
  const rest = posts.filter(p => p.id !== pinned?.id);
  const cover = posts.slice(0, 3);
  const backdrop = pinned ? firstImage(pinned) : null;
  const hue = Array.from(m.name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const since = new Date(m.created_at * 1000).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstName = m.name.split(" ")[0];
  const ld = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@type": "Person", name: m.name, alternateName: "@" + m.handle, description: m.headline || m.bio || undefined, homeLocation: m.location || undefined, knowsAbout: m.skills, sameAs: Object.values(m.socials) },
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />

      <section className="relative overflow-hidden rounded-[32px] bg-card shadow-[inset_0_0_0_1px_var(--color-line)]">
        <div className="relative h-[130px] overflow-hidden sm:h-[260px]">
          {backdrop ? (
            <FadeImg src={backdrop} className="absolute inset-0 size-full scale-125 object-cover opacity-80 blur-3xl saturate-150" />
          ) : (
            <div className="absolute inset-0" style={{ background: `radial-gradient(60% 90% at 20% 20%, hsl(${hue} 90% 72%), transparent 70%), radial-gradient(60% 90% at 80% 40%, hsl(${(hue + 60) % 360} 90% 70%), transparent 70%), #EEF0F4` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/10 to-white/70" />
          {cover.length > 0 && (
            <div className="absolute bottom-8 right-6 hidden items-end gap-4 md:flex lg:right-10">
              {cover.map((p, i) => {
                const img = firstImage(p);
                const wide = p.w / p.h > 1.15;
                return (
                  <Link key={p.id} href={`/community/${p.id}`} className="float-in block" style={{ "--d": `${200 + i * 120}ms` } as React.CSSProperties} aria-label={p.title}>
                    <span className="block transition-transform duration-700 [transition-timing-function:var(--spring)] hover:-translate-y-2 hover:rotate-0" style={{ rotate: `${(i - 1) * 2}deg` }}>
                    <Device w={p.w} h={p.h} round={!!p.round} width={p.round ? 150 : wide ? 230 : 120}>
                      {img && <img src={img} alt="" className="block size-full object-cover" />}
                    </Device>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative px-6 pb-8 sm:px-10">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-5 sm:-mt-20">
            <div className="scale-in rounded-full bg-card p-1.5 shadow-[0_10px_30px_-10px_rgb(12_18_34/0.35)]" style={{ animationDelay: "120ms" }}>
              <span className="block sm:hidden"><Avatar src={m.avatar} name={m.name} size={104} /></span>
              <span className="hidden sm:block"><Avatar src={m.avatar} name={m.name} size={136} /></span>
            </div>
            <div className="stagger flex flex-wrap gap-2.5 pb-2" style={{ "--d": "250ms" } as React.CSSProperties}>
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
          </div>

          <div className="stagger" style={{ "--d": "150ms" } as React.CSSProperties}>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-[2.1rem] font-semibold leading-tight sm:text-[2.6rem]">{m.name}</h1>
            {m.hire_open && (
              <a href="#hire" className="inline-flex items-center gap-2 rounded-full bg-[#E7F7EE] px-3 py-1 text-sm font-medium text-[#137A41]">
                <span className="size-2 rounded-full bg-live" />
                Available for work
              </a>
            )}
          </div>
          {m.headline && <p className="mt-2 max-w-2xl text-lg text-ink/80">{m.headline}</p>}
          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px] text-mist">
            <span>@{m.handle}</span>
            {m.location && <span className="flex items-center gap-1.5"><MapPin size={15} />{m.location}</span>}
            <span>Making screens since {since}</span>
          </p>
          </div>

          <dl data-reveal className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-line shadow-[inset_0_0_0_1px_var(--color-line)] sm:grid-cols-4">
            {[["Projects", m.posts], ["Likes", m.likes], ["Remixes", m.remixes], ["Followers", m.followers]].map(([k, v]) => (
              <div key={k} className="bg-paper px-5 py-4">
                <dd className="font-display text-2xl font-semibold tabular-nums"><CountUp value={Number(v)} /></dd>
                <dt className="mt-0.5 text-sm text-mist">{k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 min-w-0 lg:order-1">
          {pinned ? (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-semibold">Projects</h2>
                <span className="text-sm text-mist">{posts.length} published</span>
              </div>
              <PinnedProject p={pinned} explicit={pinned.id === m.pinned_post} />
              {rest.length > 0 && (
                <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-10 sm:grid-cols-2">
                  {rest.map((p, i) => <PostCard key={p.id} p={p} i={i} />)}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-line-strong px-6 py-16 text-center">
              <h2 className="text-xl font-semibold">{isMe ? "Your projects become your portfolio" : "No projects yet"}</h2>
              <p className="mx-auto mt-2 max-w-md text-graphite">{isMe ? "Publish a screen from the editor and it shows up here, on your profile, for anyone looking to hire." : `${firstName} has not published a project yet.`}</p>
              {isMe && <a href="/editor" className="btn btn-primary mt-6">Open the editor</a>}
            </div>
          )}
        </div>

        <aside className="order-1 min-w-0 space-y-6 lg:order-2">
          {(m.bio || m.skills.length > 0) && (
            <section data-reveal className="rounded-[20px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h2 className="font-sans text-[13px] font-medium tracking-normal text-mist">About</h2>
              {m.bio && <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{m.bio}</p>}
              {m.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.skills.map(s => (
                    <Link key={s} href={`/makers?skill=${encodeURIComponent(s)}`} className="rounded-full bg-paper px-3 py-1.5 text-[13px] font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">{s}</Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {m.hire_open && (
            <section data-reveal style={{ "--i": 1 } as React.CSSProperties} id="hire" className="scroll-mt-24 overflow-hidden rounded-[20px] bg-card shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div className="bg-[linear-gradient(135deg,#E8F0FF,#F3EAFF_55%,#FFEFE6)] p-5">
                <p className="flex items-center gap-2 text-[13px] font-medium text-[#137A41]"><span className="size-2 rounded-full bg-live" />Available for work</p>
                <h2 className="mt-2 text-xl font-semibold">Work with {firstName}</h2>
                {m.hire_note && <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink/80">{m.hire_note}</p>}
              </div>
              <ul className="divide-y divide-line">
                {m.hire_types.length > 0 && (
                  <li className="flex items-start gap-3 px-5 py-3.5 text-[15px]"><Clock size={18} className="mt-0.5 shrink-0 text-mist" /><span>{m.hire_types.join(", ")}</span></li>
                )}
                {m.hire_rate && <li className="flex items-start gap-3 px-5 py-3.5 text-[15px]"><Wallet size={18} className="mt-0.5 shrink-0 text-mist" /><span>{m.hire_rate}</span></li>}
              </ul>
              {!isMe && (
                <div className="p-5 pt-2">
                  <HireButton handle={m.handle} name={m.name} types={m.hire_types} signedIn={!!me} full label="Send a request" />
                  <p className="mt-2.5 text-center text-xs text-mist">Requests go to {firstName}&apos;s Epixo inbox.</p>
                </div>
              )}
            </section>
          )}

          {Object.keys(m.socials).length > 0 && (
            <section data-reveal style={{ "--i": 2 } as React.CSSProperties}>
              <h2 className="mb-2 px-1 font-sans text-[13px] font-medium tracking-normal text-mist">Find {firstName} on</h2>
              <SocialLinks socials={m.socials} />
            </section>
          )}

          {boards.length > 0 && (
            <section data-reveal style={{ "--i": 3 } as React.CSSProperties} className="rounded-[20px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h2 className="font-sans text-[13px] font-medium tracking-normal text-mist">Builds for</h2>
              <ul className="mt-3 space-y-2.5">
                {boards.map(b => {
                  const bd = b.board_id ? findBoard(b.board_id) : null;
                  return (
                    <li key={b.board_label} className="flex items-center justify-between gap-3 text-[15px]">
                      {bd ? <Link href={`/boards/${bd.id}`} className="truncate hover:text-signal">{b.board_label}</Link> : <span className="truncate">{b.board_label}</span>}
                      <span className="shrink-0 text-sm tabular-nums text-mist">{b.n}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {isMe && !m.hire_open && (
            <Link href="/settings#hire" className="block rounded-[20px] border border-dashed border-line-strong p-5 hover:bg-card">
              <p className="font-medium">Let people hire you</p>
              <p className="mt-1 text-sm text-graphite">Turn on Available for work and a Hire button appears on your profile and projects.</p>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function PinnedProject({ p, explicit }: { p: Awaited<ReturnType<typeof listPosts>>[number]; explicit: boolean }) {
  const imgs = imagesOf(p);
  const wide = p.w / p.h > 1.15;
  return (
    <Link data-reveal href={`/community/${p.id}`} className="press group mt-5 grid items-center gap-8 overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#EEF0F4,#E4E7EC)] p-6 transition-shadow hover:shadow-[inset_0_0_0_1px_rgb(12_18_34/0.14)] sm:p-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Tilt className="flex items-center justify-center">
        <Device w={p.w} h={p.h} round={!!p.round} width={p.round ? "70%" : wide ? "100%" : "62%"}>
          {imgs[0] && <FadeImg src={imgs[0]} className="block size-full object-cover" />}
        </Device>
      </Tilt>
      <div>
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-mist"><Pin size={14} />{explicit ? "Pinned project" : "Top project"}</p>
        <h3 className="mt-2 text-2xl font-semibold group-hover:text-signal">{p.title}</h3>
        {p.description && <p className="mt-2 line-clamp-3 text-[15px] text-graphite">{p.description}</p>}
        <p className="mt-4 text-sm text-mist">{p.board_label || `${p.w} × ${p.h}`}</p>
        <p className="mt-3 flex gap-4 text-sm text-graphite">
          <span className="flex items-center gap-1.5"><Heart size={15} />{p.likes}</span>
          <span className="flex items-center gap-1.5"><Repeat2 size={15} />{p.remixes} remixes</span>
          <span>{imgs.length} {imgs.length === 1 ? "screen" : "screens"}</span>
        </p>
      </div>
    </Link>
  );
}
