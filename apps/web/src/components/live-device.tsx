"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Device } from "./device";
import { createEngine, lvgl, templateProject, type LvBoard } from "@/lib/lvgl";

export function LiveDevice({ board, templates, width, every = 7000, offset = 0, className, onTemplate }: { board: LvBoard; templates: string[]; width: number | string; every?: number; offset?: number; className?: string; onTemplate?: (key: string) => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"loading" | "on" | "off">("loading");
  const cb = useRef(onTemplate);
  cb.current = onTemplate;

  useEffect(() => {
    let eng: any = null, raf = 0, timer: any = 0, dead = false, visible = true, last = 0, idx = 0, touchedAt = 0, downAt = 0, relT: any = 0;
    const el = cv.current!;
    const ctx = el.getContext("2d")!;
    el.width = board.w;
    el.height = board.h;

    async function load(i: number) {
      const { E } = await lvgl();
      const p = await templateProject(templates[i % templates.length], board);
      if (dead) return;
      eng.exec(E.toScript(p));
      cb.current?.(templates[i % templates.length]);
    }
    const frame = (t: number) => {
      const dt = last ? Math.min(100, t - last) : 16;
      last = t;
      if (eng && visible && !document.hidden && eng.tick(dt)) eng.paint(ctx);
      raf = requestAnimationFrame(frame);
    };
    const xy = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * board.w, ((e.clientY - r.top) / r.height) * board.h];
    };
    const down = (e: PointerEvent) => {
      if (!eng) return;
      touchedAt = performance.now();
      downAt = touchedAt;
      clearTimeout(relT);
      el.setPointerCapture(e.pointerId);
      const [x, y] = xy(e);
      eng.pointer(x, y, true);
      eng.tick(1);
    };
    const move = (e: PointerEvent) => {
      if (!eng || !el.hasPointerCapture(e.pointerId)) return;
      const [x, y] = xy(e);
      eng.pointer(x, y, true);
    };
    const up = (e: PointerEvent) => {
      if (!eng) return;
      touchedAt = performance.now();
      const [x, y] = xy(e);
      eng.pointer(x, y, true);
      relT = setTimeout(() => eng.pointer(x, y, false), Math.max(0, 70 - (performance.now() - downAt)));
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(el);

    (async () => {
      try {
        eng = await createEngine(board.w, board.h);
        if (dead) return;
        await load(0);
        eng.renderTo(ctx, 300);
        setState("on");
        raf = requestAnimationFrame(frame);
        if (templates.length > 1) {
          const start = () => {
            timer = setInterval(() => {
              if (!visible || document.hidden || performance.now() - touchedAt < 12000) return;
              idx++;
              load(idx);
            }, every);
          };
          setTimeout(start, offset);
        }
      } catch {
        setState("off");
      }
    })();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      clearInterval(timer);
      clearTimeout(relT);
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [board, templates, every, offset]);

  return (
    <Device w={board.w} h={board.h} round={board.round} width={width} className={className}>
      <canvas ref={cv} className={`block size-full touch-none select-none transition-opacity duration-500 ${state === "on" ? "opacity-100" : "opacity-0"}`} style={{ cursor: "pointer" }} aria-label={`Live LVGL screen on ${board.name ?? "a device"}. Tap to interact.`} />
      {state === "loading" && <span className="shimmer-dark absolute inset-0" aria-hidden />}
      {state === "off" && <span className="absolute inset-0 grid place-items-center p-4 text-center text-xs text-white/60">The LVGL engine needs WebAssembly to run here.</span>}
    </Device>
  );
}
