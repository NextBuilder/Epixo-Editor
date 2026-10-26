import type { CSSProperties, ReactNode } from "react";

// A display drawn as hardware: a thin dark bezel, a soft highlight and a grounded shadow.
const SHADOW = "shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_0_0_1px_var(--device-edge),0_24px_48px_-24px_rgb(0_0_0/0.45),0_8px_16px_-10px_rgb(0_0_0/0.25)]";

export function Device({ w, h, round, width, children, className = "", style }: { w: number; h: number; round?: boolean; width: number | string; children: ReactNode; className?: string; style?: CSSProperties }) {
  if (round) {
    return (
      <div className={`relative rounded-full bg-bezel p-[4.5%] ${SHADOW} ${className}`} style={{ width, aspectRatio: 1, ...style }}>
        <div className="relative size-full overflow-hidden rounded-full bg-black">{children}</div>
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(120%_80%_at_30%_0%,rgb(255_255_255/0.09),transparent_45%)]" />
      </div>
    );
  }
  return (
    <div className={`relative rounded-[clamp(9px,4%,20px)] bg-bezel p-[clamp(5px,2.6%,12px)] ${SHADOW} ${className}`} style={{ width, ...style }}>
      <div className="relative overflow-hidden rounded-[3px] bg-black" style={{ aspectRatio: w / h }}>
        {children}
      </div>
    </div>
  );
}

export function deviceWidth(w: number, h: number, round: boolean, scale = 1) {
  const r = w / h;
  if (round) return `${Math.round(60 * scale)}%`;
  if (r > 1.15) return `${Math.round(84 * scale)}%`;
  return `${Math.round(Math.min(58, r * 66) * scale)}%`;
}
