import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PostGrid } from "@/components/post-card";
import { communityStats, listPosts, postBrands, type Sort } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Community projects",
  description: "LVGL screens made by makers in Epixo. Open any project in the editor, remix it for your board and publish your own version.",
};

const SORTS: [Sort, string][] = [
  ["trending", "Trending"],
  ["new", "Newest"],
  ["top", "Most liked"],
];
const PER = 24;

type SP = Promise<{ q?: string; brand?: string; sort?: string; tag?: string; page?: string }>;

export default async function Community({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const sort = (SORTS.find(s => s[0] === sp.sort)?.[0] ?? "trending") as Sort;
  const page = Math.max(1, Math.min(50, Number(sp.page) || 1));
  const q = (sp.q ?? "").slice(0, 80);
  const brand = sp.brand?.slice(0, 40);
  const tag = sp.tag?.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20);
  const [posts, brands, stats] = await Promise.all([listPosts({ q, brand, tag, sort, limit: PER * page + 1 }), postBrands(), communityStats()]);
  const more = posts.length > PER * page;
  const href = (o: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const m = { q: q || undefined, brand, sort: sort === "trending" ? undefined : sort, tag, ...o };
    for (const [k, v] of Object.entries(m)) if (v) u.set(k, v);
    const s = u.toString();
    return s ? `/community?${s}` : "/community";
  };
  const filtered = !!(q || brand || tag);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6">
      <div className="stagger flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold sm:text-5xl">Community</h1>
          <p className="mt-4 max-w-xl text-lg text-graphite">
            Screens made in Epixo by makers everywhere. Open one in the editor, make it yours and publish your version.
            {stats && stats.posts > 0 ? ` ${stats.posts} ${stats.posts === 1 ? "project" : "projects"} from ${stats.makers} ${stats.makers === 1 ? "maker" : "makers"} so far.` : ""}
          </p>
        </div>
        <a href="/editor" className="btn btn-primary">Share a project</a>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-center">
        <form action="/community" className="relative flex-1 lg:max-w-md" role="search">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
          <input name="q" defaultValue={q} className="field pl-10" placeholder="Search projects, boards or makers" aria-label="Search projects" />
          {brand && <input type="hidden" name="brand" value={brand} />}
          {sort !== "trending" && <input type="hidden" name="sort" value={sort} />}
        </form>
        <nav className="flex gap-1 lg:ml-auto" aria-label="Sort">
          {SORTS.map(([k, label]) => (
            <Link key={k} href={href({ sort: k === "trending" ? undefined : k, page: undefined })} className={`pill rounded-lg px-3 py-2 text-[15px] ${sort === k ? "bg-card font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]" : "text-graphite hover:text-ink"}`} aria-current={sort === k ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {brands.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by maker">
          <Link href={href({ brand: undefined, page: undefined })} className={`pill rounded-full px-3.5 py-1.5 text-sm ${!brand ? "bg-ink text-white" : "bg-card text-graphite shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink"}`}>
            All boards
          </Link>
          {brands.map(b => (
            <Link key={b.brand} href={href({ brand: b.brand, page: undefined })} className={`pill rounded-full px-3.5 py-1.5 text-sm ${brand === b.brand ? "bg-ink text-white" : "bg-card text-graphite shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink"}`}>
              {b.brand} <span className="opacity-60">{b.n}</span>
            </Link>
          ))}
        </div>
      )}
      {tag && (
        <p className="mt-4 text-sm text-graphite">
          Tagged <span className="font-medium text-ink">#{tag}</span>.{" "}
          <Link href={href({ tag: undefined })} className="text-signal hover:underline">Clear</Link>
        </p>
      )}

      <div className="mt-10">
        {posts.length ? (
          <>
            <PostGrid posts={posts.slice(0, PER * page)} />
            {more && (
              <div className="mt-14 text-center">
                <Link href={href({ page: String(page + 1) })} scroll={false} className="btn btn-quiet">Show more projects</Link>
              </div>
            )}
          </>
        ) : filtered ? (
          <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">Nothing matches yet</h2>
            <p className="mx-auto mt-2 max-w-md text-graphite">Try a shorter search or another board. Or be the first: design it and publish.</p>
            <Link href="/community" className="btn btn-quiet mt-6">Show all projects</Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">The first project here could be yours</h2>
            <p className="mx-auto mt-2 max-w-md text-graphite">Design a screen, press Publish in the editor, and it shows up here for everyone to open and remix.</p>
            <a href="/editor" className="btn btn-primary mt-6">Start a project</a>
          </div>
        )}
      </div>
    </div>
  );
}
