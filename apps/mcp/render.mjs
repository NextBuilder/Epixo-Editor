// Draws screens with the real LVGL engine (the same WebAssembly the editor uses) and encodes them as PNG.
import fs from "node:fs";
import zlib from "node:zlib";
import { createRequire } from "node:module";
import { editorDir } from "./paths.mjs";

const require = createRequire(import.meta.url);
const E = require(`${editorDir}/core.js`);
require(`${editorDir}/engine.js`);

let engine = null;
async function getEngine(w, h) {
  if (!engine) engine = await globalThis.EpixoEngine.create(fs.readFileSync(`${editorDir}/epixo-lvgl.wasm`), w, h);
  else if (engine.w !== w || engine.h !== h) engine.init(w, h);
  return engine;
}

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0); head.writeUInt32BE(h, 4); head[8] = 8; head[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", head), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

// Round displays get the corners outside the circle painted neutral grey, like the bezel in the editor.
export async function renderScreen(P, s) {
  const { w, h, round } = P.board;
  const eng = await getEngine(w, h);
  eng.exec("X\n" + E.scriptScreen(P, s) + "\nL\t" + E.sid(s.id) + "\n");
  for (let t = 0; t < 500; t += 50) eng.tick(50);
  eng.refresh();
  const fb = new Uint16Array(eng.x.memory.buffer, eng.fbPtr, w * h), rgb = Buffer.alloc(w * h * 3), r = Math.min(w, h) / 2;
  for (let i = 0; i < w * h; i++) {
    const x = i % w, y = (i / w) | 0;
    if (round && Math.hypot(x + 0.5 - w / 2, y + 0.5 - h / 2) > r) { rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = 40; continue; }
    const c = fb[i];
    rgb[i * 3] = ((c >> 11) * 255 / 31 + 0.5) | 0;
    rgb[i * 3 + 1] = (((c >> 5) & 63) * 255 / 63 + 0.5) | 0;
    rgb[i * 3 + 2] = ((c & 31) * 255 / 31 + 0.5) | 0;
  }
  return png(w, h, rgb);
}

export const measure = (font, text) => (engine ? engine.measure(font, text) : E.measureText(font, text));
