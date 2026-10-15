import type { CSSProperties, ReactNode } from "react";

export function Device({ w, h, round, width, children, className = "", style }: { w: number; h: number; round?: boolean; width: number | string; children: ReactNode; className?: string; style?: CSSProperties }) {
  const ratio = w / h;
  if (round) {
    return (
      <div className={`relative rounded-full bg-bezel p-[5.5%] shadow-[0_30px_60px_-25px_rgb(12_18_34/0.55),inset_0_0_0_1px_rgb(255_255_255/0.08)] ${className}`} style={{ width, aspectRatio: 1, ...style }}>
        <div className="relative size-full overflow-hidden rounded-full bg-black ring-1 ring-black">{children}</div>
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(120%_80%_at_30%_0%,rgb(255_255_255/0.10),transparent_45%)]" />
      </div>
    );
  }
  return (
    <div className={`relative rounded-[clamp(10px,4.5%,22px)] bg-bezel p-[clamp(6px,3.2%,14px)] shadow-[0_30px_60px_-25px_rgb(12_18_34/0.55),inset_0_0_0_1px_rgb(255_255_255/0.08)] ${className}`} style={{ width, ...style }}>
      <div className="relative overflow-hidden rounded-[4px] bg-black" style={{ aspectRatio: ratio }}>
        {children}
      </div>
    </div>
  );
}
