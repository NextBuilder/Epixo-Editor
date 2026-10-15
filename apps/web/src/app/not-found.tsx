import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[560px] px-4 pt-28 text-center">
      <p className="font-display text-6xl font-semibold text-signal">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Nothing on this screen</h1>
      <p className="mt-3 text-graphite">The page may have moved, or the project was unpublished.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn btn-quiet">Go home</Link>
        <Link href="/community" className="btn btn-primary">Browse projects</Link>
      </div>
    </div>
  );
}
