import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectList } from "@/components/project-list";
import { HireInbox, type HireReq } from "@/components/hire-inbox";
import { parseSocials } from "@/lib/profile";
import { CountUp } from "@/components/motion/motion";
import { PostGrid } from "@/components/post-card";
import { listPosts } from "@/lib/posts";
import { all, currentUser, env, first } from "@/lib/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your dashboard", robots: { index: false } };

export type ProjectRow = { id: string; name: string; board_label: string | null; w: number; h: number; screens: number; updated_at: number; post_id: string | null };

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard");
  const [projects, posts, e, inbox, fol] = await Promise.all([
    all<ProjectRow>("SELECT p.id, p.name, p.board_label, p.w, p.h, p.screens, p.updated_at, po.id AS post_id FROM projects p LEFT JOIN posts po ON po.project_id = p.id WHERE p.owner_id = ? ORDER BY p.updated_at DESC LIMIT 200", user.id),
    listPosts({ owner: user.id, sort: "new", limit: 60, includeHidden: true }),
    env(),
    all<HireReq>("SELECT h.id, h.name, h.email, h.company, h.kind, h.budget, h.timeline, h.message, h.status, h.created_at, u.handle, u.avatar FROM hire_requests h JOIN users u ON u.id = h.from_user WHERE h.to_user = ? AND h.status != 'archived' ORDER BY h.created_at DESC LIMIT 100", user.id).catch(() => [] as HireReq[]),
    first<{ n: number }>("SELECT COUNT(*) AS n FROM follows WHERE followee_id = ?", user.id).catch(() => null),
  ]);
  const unread = inbox.filter(r => r.status === "new").length;
  const checks: [string, boolean][] = [
    ["Add a profile photo", !!user.avatar],
    ["Write a headline", !!user.headline],
    ["Tell people about yourself", !!user.bio],
    ["Add your skills", !!user.skills],
    ["Link your social profiles", Object.keys(parseSocials(user.socials)).length > 0],
    ["Publish a project", posts.length > 0],
    ["Turn on Available for work", !!user.hire_open],
  ];
  const done = checks.filter(c => c[1]).length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="stagger text-4xl font-semibold"><span className="inline-block">Hi, {user.name.split(" ")[0]}</span></h1>
          <p className="mt-2 text-graphite">
            Your projects save here automatically from the editor.{" "}
            <Link href={`/u/${user.handle}`} className="text-signal hover:underline">See your public profile</Link>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/settings" className="btn btn-quiet">Edit profile</Link>
          <a href="/editor?new=1" className="btn btn-primary">New project</a>
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-line py-5 sm:grid-cols-4">
        <div><dt className="text-sm text-graphite">Saved projects</dt><dd className="mt-1 text-2xl font-semibold tabular-nums"><CountUp value={projects.length} /></dd></div>
        <div><dt className="text-sm text-graphite">Published</dt><dd className="mt-1 text-2xl font-semibold tabular-nums"><CountUp value={posts.length} /></dd></div>
        <div><dt className="text-sm text-graphite">Likes and followers</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{posts.reduce((a, p) => a + p.likes, 0)} <span className="text-mist">/</span> {fol?.n ?? 0}</dd></div>
        <div>
          <dt className="text-sm text-graphite">AI credits</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{e.ANTHROPIC_API_KEY ? user.ai_credits : <span className="text-base font-normal text-mist">Not switched on yet</span>}</dd>
        </div>
      </dl>

      {done < checks.length && (
        <section data-reveal className="mt-10 rounded-[24px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Make your profile work for you</h2>
              <p className="mt-1 text-sm text-graphite">Complete profiles get found in the makers directory and hired more often.</p>
            </div>
            <span className="font-display text-2xl font-semibold tabular-nums"><CountUp value={Math.round((done / checks.length) * 100)} duration={1200} />%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper"><div className="grow-x h-full rounded-full bg-[linear-gradient(90deg,#2B5BFF,#8B3DF0,#E8306E)]" style={{ width: `${(done / checks.length) * 100}%` }} /></div>
          <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {checks.map(([t, ok]) => (
              <li key={t} className={`flex items-center gap-2.5 text-[15px] ${ok ? "text-mist line-through" : ""}`}>
                <span className={`grid size-5 place-items-center rounded-full text-[11px] ${ok ? "bg-live text-white" : "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]"}`}>{ok ? "✓" : ""}</span>
                {ok ? t : <Link href={t.startsWith("Publish") ? "/editor" : t.includes("Available") ? "/settings#hire" : "/settings"} className="hover:text-signal">{t}</Link>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14" id="inbox">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-2xl font-semibold">Hire requests</h2>
          {unread > 0 && <span className="rounded-full bg-signal px-2.5 py-0.5 text-sm font-semibold text-white">{unread} new</span>}
        </div>
        <HireInbox initial={inbox} hireOpen={!!user.hire_open} />
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <ProjectList initial={projects} />
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold">Published to the community</h2>
        <div className="mt-8">
          {posts.length ? <PostGrid posts={posts} /> : <p className="text-graphite">Nothing published yet. In the editor, press Publish to share a project.</p>}
        </div>
      </section>
    </div>
  );
}
