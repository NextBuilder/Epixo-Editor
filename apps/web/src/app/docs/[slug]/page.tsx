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
    <div className="mx-auto grid max-w-[1200px] gap-12 px-4 pt-12 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside>
        <nav className="lg:sticky lg:top-24" aria-label="Documentation">
          {DOC_GROUPS.map(g => (
            <div key={g} className="mb-6">
              <p className="px-3 text-sm font-semibold text-ink">{g}</p>
              <ul className="mt-2">
                {DOCS.filter(x => x.group === g).map(x => (
                  <li key={x.slug}>
                    <Link href={`/docs/${x.slug}`} className={`block rounded-lg px-3 py-1.5 text-[15px] ${x.slug === d.slug ? "bg-card font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-line)]" : "text-graphite hover:text-ink"}`} aria-current={x.slug === d.slug ? "page" : undefined}>
                      {x.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <article className="min-w-0 pb-10">
        <p className="text-sm text-graphite">{d.group}</p>
        <h1 className="mt-1 text-4xl font-semibold">{d.title}</h1>
        <p className="mt-3 max-w-[60ch] text-lg text-graphite">{d.summary}</p>
        <div className="prose-epx mt-10 [&_a]:font-medium [&_a]:text-signal hover:[&_a]:underline">{d.body}</div>
        {next && (
          <Link href={`/docs/${next.slug}`} className="mt-14 block max-w-md rounded-2xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
            <span className="text-sm text-mist">Next</span>
            <span className="mt-1 block font-semibold">{next.title}</span>
            <span className="mt-1 block text-sm text-graphite">{next.summary}</span>
          </Link>
        )}
      </article>
    </div>
  );
}
