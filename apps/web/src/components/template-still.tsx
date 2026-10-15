"use client";

import { useEffect, useRef, useState } from "react";
import { Device } from "./device";
import { renderStill, templateProject, type LvBoard } from "@/lib/lvgl";

export function TemplateStill({ board, template, screen = 0, width = "100%", bare = false }: { board: LvBoard; template: string; screen?: number; width?: number | string; bare?: boolean }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = cv.current!;
    let dead = false;
    setDone(false);
    const io = new IntersectionObserver(
      async ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        try {
          const p = await templateProject(template, board);
          if (dead) return;
          await renderStill(el, p, screen);
          if (!dead) setDone(true);
        } catch {}
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      dead = true;
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.w, board.h, board.round, template, screen]);

  const canvasEl = <canvas ref={cv} width={board.w} height={board.h} className={`block size-full transition-[opacity,transform] duration-700 ${done ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`} aria-label={`${template} template rendered by LVGL at ${board.w} by ${board.h}`} />;
  const canvas = (
    <>
      {!done && <span className="shimmer absolute inset-0" aria-hidden />}
      {canvasEl}
    </>
  );
  if (bare) return canvas;
  return (
    <Device w={board.w} h={board.h} round={board.round} width={width}>
      {canvas}
    </Device>
  );
}
