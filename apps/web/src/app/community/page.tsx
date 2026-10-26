import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Empty } from "@/components/empty";
import { PostGrid } from "@/components/post-card";
import { currentUser } from "@/lib/server";
import { listPosts, postBrands, type Sort } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Community",
  description: "LVGL screens made by makers in Epixo. Open any project in the editor, remix it for your board and publish your own version.",
};

const SORTS = [["trending", "Trending"], ["new", "New"], ["top", "Top"], ["following", "Following"]] as const;
const PER = 24;

type SP = Promise<{ q?: string; brand?: string; sort?: string; tag?: string; page?: string }>;

export default async function Community({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const user = await currentUser().catch(() => null);
  const view = SORTS.find(s => s[0] === sp.sort)?.[0] ?? "trending";
  const following = view === "following";
  const sort: Sort = following || view === "new" ? "new" : view === "top" ? "top" : "trending";
  const page = Math.max(1, Math.min(50, Number(sp.page) || 1));
  const q = (sp.q ?? "").slice(0, 80);
  const brand = sp.brand?.slice(0, 40);
  const tag = sp.tag?.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20);
  const [posts, brands] = await Promise.all([
    following && !user ? Promise.resolve([]) : listPosts({ q, brand, tag, sort, following: following ? user!.id : undefined, limit: PER * page + 1 }),
    postBrands(),
  ]);
  const more = posts.length > PER * page;
  const href = (o: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const m = { q: q || undefined, brand, sort: view === "trending" ? undefined : view, tag, ...o };
    for (const [k, v] of Object.entries(m)) if (v) u.set(k, v);
    const s = u.toString();
    return s ? `/community?${s}` : "/community";
  };
  const filtered = !!(q || brand || tag);

  return (
    <div className="wrap pt-12 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <h1 className="t-display">Community</h1>
        <a href="/editor" className="btn btn-primary btn-sm">Share yours</a>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <nav className="seg self-start" aria-label="Sort">
          {SORTS.map(([k, label]) => (
            <Link key={k} href={href({ sort: k === "trending" ? undefined : k, page: undefined })} data-on={view === k} aria-current={view === k ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        <form action="/community" className="search md:ml-auto md:w-80" role="search">
          <Search size={16} />
          <input name="q" defaultValue={q} placeholder="Search" aria-label="Search projects" />
          {brand && <input type="hidden" name="brand" value={brand} />}
          {view !== "trending" && <input type="hidden" name="sort" value={view} />}
        </form>
      </div>

      {brands.length > 0 && (
        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter by maker">
          <Link href={href({ brand: undefined, page: undefined })} className="chip" data-on={!brand}>All</Link>
          {brands.map(b => (
            <Link key={b.brand} href={href({ brand: b.brand, page: undefined })} className="chip" data-on={brand === b.brand}>{b.brand} <small>{b.n}</small></Link>
          ))}
        </div>
      )}
      {tag && (
        <p className="mt-4 flex items-center gap-2 text-[15px] text-graphite">
          <span className="tag tag-signal">#{tag}</span>
          <Link href={href({ tag: undefined })} className="text-signal hover:underline">Clear</Link>
        </p>
      )}

      <div className="mt-10">
        {posts.length ? (
          <>
            <PostGrid posts={posts.slice(0, PER * page)} />
            {more && (
              <div className="mt-14 text-center">
                <Link href={href({ page: String(page + 1) })} scroll={false} className="btn btn-quiet">Show more</Link>
              </div>
            )}
          </>
        ) : (
          <Empty
            title={following ? (user ? "Nothing from people you follow yet" : "See work from makers you follow") : filtered ? "No matches" : "Be the first to share"}
            body={following ? (user ? "Follow makers from their profiles and their new work shows up here." : "Sign in, follow makers you like, and their work collects here.") : filtered ? "Try another search or board." : "Publish from the editor and your screen appears here."}
            action={following && !user ? ["/login?next=/community?sort=following", "Sign in"] : following ? ["/makers", "Find makers"] : filtered ? ["/community", "Show everything"] : ["/editor", "Open the editor"]}
          />
        )}
      </div>
    </div>
  );
}

