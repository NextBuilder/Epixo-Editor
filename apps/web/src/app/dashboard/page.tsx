import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutGrid } from "@/components/icons";
import { ProjectGrid, type ProjectRow } from "@/components/project-grid";
import { HireInbox, type HireReq } from "@/components/hire-inbox";
import { Empty } from "@/components/empty";
import { parseSocials } from "@/lib/profile";
import { PostGrid } from "@/components/post-card";
import { listPosts } from "@/lib/posts";
import { all, currentUser, env } from "@/lib/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your projects", robots: { index: false } };

type SP = Promise<{ tab?: string }>;

export default async function Dashboard({ searchParams }: { searchParams: SP }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard");
  const tab = ["published", "requests"].includes((await searchParams).tab ?? "") ? (await searchParams).tab! : "projects";
  const [projects, posts, e, inbox] = await Promise.all([
    all<ProjectRow>("SELECT p.id, p.name, p.board_label, p.w, p.h, p.screens, p.updated_at, po.id AS post_id FROM projects p LEFT JOIN posts po ON po.project_id = p.id WHERE p.owner_id = ? ORDER BY p.updated_at DESC LIMIT 200", user.id),
    listPosts({ owner: user.id, sort: "new", limit: 60, includeHidden: true }),
    env(),
    all<HireReq>("SELECT h.id, h.name, h.email, h.company, h.kind, h.budget, h.timeline, h.message, h.status, h.created_at, u.handle, u.avatar FROM hire_requests h JOIN users u ON u.id = h.from_user WHERE h.to_user = ? AND h.status != 'archived' ORDER BY h.created_at DESC LIMIT 100", user.id).catch(() => [] as HireReq[]),
  ]);
  const unread = inbox.filter(r => r.status === "new").length;
  const checks: [string, boolean, string][] = [
    ["Add a photo", !!user.avatar, "/settings"],
    ["Write a headline", !!user.headline, "/settings"],
    ["Add a short bio", !!user.bio, "/settings"],
    ["List your skills", !!user.skills, "/settings"],
    ["Link your socials", Object.keys(parseSocials(user.socials)).length > 0, "/settings"],
    ["Publish a project", posts.length > 0, "/editor"],
  ];
  const todo = checks.filter(c => !c[1]);
  const pct = Math.round(((checks.length - todo.length) / checks.length) * 100);
  const C = 2 * Math.PI * 20;
  const tabs: [string, string, number][] = [["projects", "Projects", projects.length], ["published", "Published", posts.length], ["requests", "Requests", unread]];

  return (
    <div className="wrap pt-12 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="t-display">Your projects</h1>
          <p className="mt-2 text-[15px] text-mist">
            {e.ANTHROPIC_API_KEY ? `${user.ai_credits} AI credits · ` : ""}
            <Link href={`/u/${user.handle}`} className="text-signal hover:underline">View your profile</Link>
          </p>
        </div>
        <a href="/editor?new=1" className="btn btn-primary">New project</a>
      </div>

      {todo.length > 0 && (
        <section className="card mt-8 flex flex-wrap items-center gap-5 p-5" data-reveal>
          <svg viewBox="0 0 48 48" className="size-12 shrink-0 -rotate-90" aria-hidden>
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-fill-strong)" strokeWidth="5" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-signal)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(C * pct) / 100} ${C}`} />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Your profile is {pct}% complete</p>
            <p className="text-[14px] text-mist">Complete profiles get found and hired more often.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {todo.slice(0, 3).map(([t, , href]) => <Link key={t} href={href} className="chip">{t}</Link>)}
          </div>
        </section>
      )}

      <nav className="seg mt-8" aria-label="Sections" id="requests">
        {tabs.map(([k, label, n]) => (
          <Link key={k} href={k === "projects" ? "/dashboard" : `/dashboard?tab=${k}`} data-on={tab === k} aria-current={tab === k ? "page" : undefined}>
            {label}
            {n > 0 && <span className={`rounded-full px-1.5 text-[12px] font-semibold leading-5 ${k === "requests" ? "bg-signal text-white" : "bg-fill text-graphite"}`}>{n}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "projects" && <ProjectGrid initial={projects} />}
        {tab === "published" && (posts.length ? <PostGrid posts={posts} /> : <Empty icon={<LayoutGrid size={26} />} title="Nothing published yet" body="Press Publish in the editor to share a project with the community." action={["/editor", "Open the editor"]} />)}
        {tab === "requests" && <HireInbox initial={inbox} hireOpen={!!user.hire_open} />}
      </div>
    </div>
  );
}
