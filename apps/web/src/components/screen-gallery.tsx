"use client";

import { useState } from "react";
import { Device } from "./device";

export function ScreenGallery({ images, w, h, round, title }: { images: string[]; w: number; h: number; round: boolean; title: string }) {
  const [i, setI] = useState(0);
  const wide = w / h > 1.15;
  return (
    <div>
      <div className="flex min-h-[340px] items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,#EDEFF3,#E3E6EB)] px-6 py-12 sm:px-12">
        <Device w={w} h={h} round={round} width={round ? "min(66%, 420px)" : wide ? "100%" : `min(${Math.min(70, (w / h) * 80)}%, 380px)`}>
          {images[i] && <img src={images[i]} alt={`${title}, screen ${i + 1}`} className="block size-full object-cover" />}
        </Device>
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Screens">
          {images.map((src, n) => (
            <button key={src} role="tab" aria-selected={n === i} onClick={() => setI(n)} className={`shrink-0 overflow-hidden bg-bezel p-1 transition-shadow ${round ? "rounded-full" : "rounded-lg"} ${n === i ? "shadow-[0_0_0_2px_var(--color-paper),0_0_0_4px_var(--color-signal)]" : "opacity-70 hover:opacity-100"}`} style={{ width: round ? 64 : wide ? 104 : 64 }}>
              <img src={src} alt={`Screen ${n + 1}`} className={`block w-full ${round ? "rounded-full" : "rounded-[4px]"}`} style={{ aspectRatio: w / h }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
