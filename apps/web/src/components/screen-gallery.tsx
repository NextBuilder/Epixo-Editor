"use client";

import { useState } from "react";
import { Device } from "./device";

export function ScreenGallery({ images, w, h, round, title }: { images: string[]; w: number; h: number; round: boolean; title: string }) {
  const [i, setI] = useState(0);
  const wide = w / h > 1.15;
  return (
    <div>
      <div className="stage flex min-h-[360px] items-center justify-center rounded-[28px] px-6 py-14 sm:px-14">
        <Device w={w} h={h} round={round} width={round ? "min(62%, 420px)" : wide ? "100%" : `min(${Math.min(66, (w / h) * 78)}%, 360px)`}>
          {images[i] && <img key={images[i]} src={images[i]} alt={`${title}, screen ${i + 1}`} className="scale-in block size-full object-cover" />}
        </Device>
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2.5 overflow-x-auto pb-1" role="tablist" aria-label="Screens">
          {images.map((src, n) => (
            <button key={src} role="tab" aria-selected={n === i} aria-label={`Screen ${n + 1}`} onClick={() => setI(n)} className={`press shrink-0 overflow-hidden bg-bezel p-[3px] transition-[box-shadow,opacity] ${round ? "rounded-full" : "rounded-[9px]"} ${n === i ? "shadow-[0_0_0_2px_var(--color-paper),0_0_0_4px_var(--color-signal)]" : "opacity-55 hover:opacity-100"}`} style={{ width: round ? 56 : wide ? 92 : 56 }}>
              <img src={src} alt="" className={`block w-full ${round ? "rounded-full" : "rounded-[6px]"}`} style={{ aspectRatio: w / h }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
