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
// Finished renders, keyed by the exact screen script, so a screen seen once draws instantly after.
const done = new Map<string, HTMLCanvasElement>();

export function renderStill(canvas: HTMLCanvasElement, project: any, screenIndex = 0) {
  const job = queue.then(async () => {
    const { E } = await lvgl();
    const b = project.board;
    const s = project.screens[Math.min(screenIndex, project.screens.length - 1)];
    const script = "X\n" + E.scriptScreen(project, s) + "\nL\t" + E.sid(s.id) + "\n", key = b.w + "x" + b.h + "|" + script;
    canvas.width = b.w;
    canvas.height = b.h;
    const hit = done.get(key);
    if (hit) return void canvas.getContext("2d")!.drawImage(hit, 0, 0);
    shared ??= await createEngine(b.w, b.h);
    if (shared.w !== b.w || shared.h !== b.h) shared.init(b.w, b.h);
    shared.exec(script);
    shared.img = null;
    shared.renderTo(canvas.getContext("2d"), 450);
    const copy = document.createElement("canvas");
    copy.width = b.w;
    copy.height = b.h;
    copy.getContext("2d")!.drawImage(canvas, 0, 0);
    if (done.size > 120) done.delete(done.keys().next().value!);
    done.set(key, copy);
    await new Promise(r => setTimeout(r, 0));
  });
  queue = job.catch(() => undefined);
  return job;
}
