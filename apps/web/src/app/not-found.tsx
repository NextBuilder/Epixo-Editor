import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap-narrow pt-28 text-center">
      <p className="font-display text-[88px] font-semibold leading-none tracking-tight text-fill-strong">404</p>
      <h1 className="mt-6 text-[32px]">This page is not here</h1>
      <p className="mt-2 text-[17px] text-graphite">It may have moved, or the project was unpublished.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn btn-quiet">Home</Link>
        <Link href="/community" className="btn btn-primary">Explore projects</Link>
      </div>
    </div>
  );
}
