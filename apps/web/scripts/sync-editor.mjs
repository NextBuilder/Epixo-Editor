import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.resolve(root, "..", "editor");
const runtime = path.resolve(root, "..", "..", "runtime");
const out = path.join(root, "public", "editor");
const require = createRequire(import.meta.url);

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true, filter: f => path.basename(f) !== "README.md" });
fs.mkdirSync(path.join(out, "runtime"), { recursive: true });
for (const f of ["epixo_rt.c", "epixo_rt.h"]) fs.copyFileSync(path.join(runtime, f), path.join(out, "runtime", f));
fs.mkdirSync(path.join(out, "vendor"), { recursive: true });
fs.copyFileSync(require.resolve("jszip/dist/jszip.min.js"), path.join(out, "vendor", "jszip.min.js"));

let html = fs.readFileSync(path.join(src, "index.html"), "utf8");
html = html.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>', '<script src="vendor/jszip.min.js"></script>');
const head = '<!doctype html><html lang="en"><head><base href="/editor/"><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" type="image/png" href="/brand/epixo-icon-192.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">';
const styleEnd = html.indexOf("</style>") + "</style>".length;
html = html.replace('<script src="app.js"></script>', '<script src="hosted.js"></script>\n<script src="app.js"></script>');
html = head + html.slice(0, styleEnd) + "</head><body>" + html.slice(styleEnd) + "</body></html>";
fs.writeFileSync(path.join(out, "index.html"), html);

const core = require(path.join(src, "core.js"));
const data = {
  boards: core.BOARDS.map(b => ({ id: b.id, brand: b.brand, name: b.name, size: b.size, w: b.w, h: b.h, round: b.round, panel: b.panel, chip: b.chip, touch: b.touch, lcd: b.lcd, tp: b.tp, pack: b.pack, bus: b.bus ?? null, v: b.v, src: b.src })),
  verify: core.VERIFY,
  templates: Object.entries(core.TPL).map(([key, t]) => ({ key, name: t.n, desc: t.d })),
  widgets: Object.entries(core.TYPES).map(([key, t]) => ({ key, name: t.n, lv: t.lv })),
};
fs.mkdirSync(path.join(root, "src", "data"), { recursive: true });
// The AI tools run on the server too, for the MCP endpoint, so they share the editor's own core.
fs.copyFileSync(path.join(src, "core.js"), path.join(root, "src", "data", "epixo-core.cjs"));
fs.writeFileSync(path.join(root, "src", "data", "core.json"), JSON.stringify(data));
console.log(`editor synced, ${data.boards.length} boards, ${data.templates.length} templates`);
