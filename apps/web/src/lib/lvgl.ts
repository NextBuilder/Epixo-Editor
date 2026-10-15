"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type LvBoard = { id?: string; w: number; h: number; round?: boolean; name?: string; brand?: string };

const WASM = "/editor/epixo-lvgl.wasm";
let ready: Promise<{ E: any; Engine: any }> | null = null;

function script(src: string) {
  return new Promise<void>((res, rej) => {
    const had = document.querySelector(`script[data-src="${src}"]`) as HTMLScriptElement | null;
    if (had) {
      if (had.dataset.loaded) return res();
      had.addEventListener("load", () => res());
      had.addEventListener("error", () => rej(new Error("load " + src)));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.dataset.src = src;
    s.onload = () => {
      s.dataset.loaded = "1";
      res();
    };
    s.onerror = () => rej(new Error("load " + src));
    document.head.appendChild(s);
  });
}

export function lvgl() {
  ready ??= Promise.all([script("/editor/core.js"), script("/editor/engine.js")]).then(() => {
    const g = globalThis as any;
    return { E: g.EpixoCore, Engine: g.EpixoEngine };
  });
  return ready;
}

export async function templateProject(key: string, b: LvBoard) {
  const { E } = await lvgl();
  const p = E.blank({ ...b });
  p.name = key;
  const ss = E.addTemplate(p, key, b.w, b.h, !!b.round);
  p.cur = ss[0].id;
  return p;
}

export async function createEngine(w: number, h: number) {
  const { Engine } = await lvgl();
  return Engine.create(WASM, w, h);
}

let shared: any = null;
let queue: Promise<unknown> = Promise.resolve();

export function renderStill(canvas: HTMLCanvasElement, project: any, screenIndex = 0) {
  const job = queue.then(async () => {
    const { E } = await lvgl();
    const b = project.board;
    shared ??= await createEngine(b.w, b.h);
    if (shared.w !== b.w || shared.h !== b.h) shared.init(b.w, b.h);
    const s = project.screens[Math.min(screenIndex, project.screens.length - 1)];
    shared.exec("X\n" + E.scriptScreen(project, s) + "\nL\t" + E.sid(s.id) + "\n");
    canvas.width = b.w;
    canvas.height = b.h;
    shared.img = null;
    shared.renderTo(canvas.getContext("2d"), 450);
    await new Promise(r => setTimeout(r, 0));
  });
  queue = job.catch(() => undefined);
  return job;
}
