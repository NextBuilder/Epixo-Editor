import { VERIFY } from "@/lib/data";

const TONE: Record<string, string> = { driver: "tag-signal", cyd: "tag-signal", web: "tag-live", spec: "tag-amber" };

export function VerifyBadge({ v }: { v: string }) {
  const x = VERIFY[v];
  if (!x) return null;
  return <span className={`tag ${TONE[v] ?? ""}`} title={x.note}>{x.label}</span>;
}

export function Shape({ w, h, round, size = 22 }: { w: number; h: number; round?: boolean; size?: number }) {
  const r = w / h;
  const bw = r >= 1 ? size : Math.max(6, Math.round(size * r));
  const bh = r >= 1 ? Math.max(6, Math.round(size / r)) : size;
  return (
    <span className="inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} aria-hidden>
      <span className={`block border-[1.5px] border-ink/60 ${round ? "rounded-full" : "rounded-[3px]"}`} style={{ width: bw, height: bh }} />
    </span>
  );
}
