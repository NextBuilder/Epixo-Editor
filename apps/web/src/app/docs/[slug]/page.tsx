import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCS, DOC_GROUPS, findDoc } from "@/lib/docs";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DOCS.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = findDoc((await params).slug);
  return d ? { title: d.title, description: d.summary } : { title: "Not found" };
}

export default async function DocPage({ params }: Props) {
  const d = findDoc((await params).slug);
  if (!d) notFound();
  const i = DOCS.indexOf(d);
  const next = DOCS[i + 1];

  return (
    <div className="wrap grid gap-12 pt-12 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav className="lg:sticky lg:top-20" aria-label="Documentation">
          {DOC_GROUPS.map(g => (
            <div key={g} className="mb-6">
              <p className="px-3 text-[13px] font-medium text-mist">{g}</p>
              <ul className="mt-2">
                {DOCS.filter(x => x.group === g).map(x => (
                  <li key={x.slug}>
                    <Link href={`/docs/${x.slug}`} className={`block rounded-lg px-3 py-1.5 text-[14px] ${x.slug === d.slug ? "bg-fill font-medium text-ink" : "text-graphite hover:text-ink"}`} aria-current={x.slug === d.slug ? "page" : undefined}>
                      {x.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <article className="min-w-0 max-w-[720px] pb-10">
        <Link href="/docs" className="text-[14px] text-signal hover:underline lg:hidden">All docs</Link>
        <h1 className="t-display mt-3 lg:mt-0">{d.title}</h1>
        <p className="t-lead mt-3">{d.summary}</p>
        <div className="prose-epx mt-10">{d.body}</div>
        {next && (
          <Link href={`/docs/${next.slug}`} className="card card-hover mt-14 block max-w-md p-5">
            <span className="text-[13px] text-mist">Next</span>
            <span className="mt-1 block font-semibold">{next.title}</span>
            <span className="mt-0.5 block text-[14px] text-graphite">{next.summary}</span>
          </Link>
        )}
      </article>
    </div>
  );
}
