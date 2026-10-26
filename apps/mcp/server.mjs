#!/usr/bin/env node
// Epixo MCP server. Lets Claude, ChatGPT and any MCP client design LVGL screens while you watch them appear in the editor.
// It speaks MCP over stdio for desktop apps, and serves the editor with a live link at http://localhost:7457.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { editorDir, runtimeDir } from "./paths.mjs";
import { renderScreen, measure } from "./render.mjs";

const require = createRequire(import.meta.url);
const E = require(`${editorDir}/core.js`);
const VERSION = JSON.parse(fs.readFileSync(new URL("./package.json", import.meta.url))).version;
const DIR = path.resolve(process.env.EPIXO_DIR || path.join(os.homedir(), "Epixo"));
const PORT = Number(process.env.EPIXO_PORT || 7457);
const URL_LIVE = `http://localhost:${PORT}/`;
const log = (...a) => process.stderr.write("[epixo] " + a.join(" ") + "\n");

/* ---------------- projects on disk ---------------- */
fs.mkdirSync(DIR, { recursive: true });
const slug = n => String(n || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "untitled";
const fileOf = name => path.join(DIR, slug(name) + ".epixo.json");
const live = { project: null, file: null, rev: 0, view: { screen: null, selected: null }, clients: new Set(), who: "AI" };

function listProjects() {
  return fs.readdirSync(DIR).filter(f => f.endsWith(".epixo.json")).map(f => {
    const st = fs.statSync(path.join(DIR, f));
    let name = f, board = "";
    try { const p = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")); name = p.name; board = p.board.brand + " " + p.board.name; } catch {}
    return { file: f, name, board, updated: st.mtimeMs };
  }).sort((a, b) => b.updated - a.updated);
}
function load(file) {
  const p = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!p || !p.board || !Array.isArray(p.screens) || !p.screens.length) throw new Error("That file is not an Epixo project.");
  p.counts = p.counts || {}; p.seq = p.seq || 0; p.lvgl = p.lvgl || 9;
  if (!p.screens.some(s => s.id == p.cur)) p.cur = p.screens[0].id;
  return p;
}
function persist() {
  live.project.updated = Date.now();
  fs.writeFileSync(live.file, JSON.stringify(live.project, null, 1));
}
function useProject(p, file, why) {
  live.project = p; live.file = file; live.rev++;
  persist(); broadcast(why);
}
function startup() {
  const recent = listProjects()[0];
  if (recent) { try { live.project = load(path.join(DIR, recent.file)); live.file = path.join(DIR, recent.file); return; } catch (e) { log("could not open", recent.file, e.message); } }
  const p = E.defaultProject();
  p.pid = "local";
  live.project = p; live.file = fileOf(p.name); persist();
}

/* ---------------- tools ---------------- */
const SCREEN_REF = { type: "string", description: "Screen name. Leave out for the open screen." };
const LOCAL_TOOLS = [
  { name: "list_projects", description: `Projects saved in ${DIR}, newest first.`, inputSchema: { type: "object", properties: {} },
    run: () => ({ folder: DIR, open: live.project.name, projects: listProjects().map(p => ({ name: p.name, board: p.board, updated: new Date(p.updated).toISOString() })) }) },
  { name: "open_project", description: "Open a saved project by name. The editor switches to it too.", inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    run: a => {
      const hit = listProjects().find(p => p.name.toLowerCase() == String(a.name).toLowerCase() || p.file == a.name || slug(p.name) == slug(a.name));
      if (!hit) throw new Error(`No project called "${a.name}". Use list_projects.`);
      useProject(load(path.join(DIR, hit.file)), path.join(DIR, hit.file), "Opened " + hit.name);
      return E.runTool(live.project, "get_project");
    } },
  { name: "new_project", description: "Start a new project. Pick a board id from find_boards (it keeps the current board if you leave it out) and optionally a template to start from.", inputSchema: { type: "object", properties: { name: { type: "string" }, board: { type: "string" }, rotated: { type: "boolean" }, template: { type: "string", enum: Object.keys(E.TPL) } }, required: ["name"] },
    run: a => {
      const b0 = a.board ? E.BOARDS.find(b => b.id == a.board) : live.project.board;
      if (!b0) throw new Error(`No board with id "${a.board}". Use find_boards.`);
      const b = a.board ? E.withRotation(b0, a.rotated ? 90 : 0) : b0;
      const p = E.blank(b); p.name = String(a.name).slice(0, 60) || "Untitled UI"; p.pid = "local";
      const ss = a.template && E.TPL[a.template] ? E.addTemplate(p, a.template, b.w, b.h, b.round) : [E.mkScreen(p, "Home")];
      p.cur = ss[0].id;
      let file = fileOf(p.name);
      for (let i = 2; fs.existsSync(file); i++) file = fileOf(p.name + " " + i);
      useProject(p, file, "New project " + p.name);
      return E.runTool(p, "get_project");
    } },
  { name: "render_screen", description: "Draw a screen with the real LVGL engine and look at it. Use it after every big change to check how it really looks.", inputSchema: { type: "object", properties: { screen: SCREEN_REF } },
    image: true,
    run: async a => {
      const P = live.project, s = E.runTool(P, "get_screen", a);
      const scr = P.screens.find(x => x.name == s.screen);
      return { png: await renderScreen(P, scr), text: `${scr.name} on ${P.board.brand} ${P.board.name}, ${P.board.w} x ${P.board.h}${P.board.round ? ", round" : ""}. ${s.problems.length ? s.problems.length + " Design Doctor notes." : "Design Doctor is happy."}` };
    } },
  { name: "export_project", description: "Write the project's code to a folder next to the project file: LVGL C (ui.c, ui.h), MicroPython, LVGL XML, ESPHome YAML, PNG screens and the project file.", inputSchema: { type: "object", properties: { formats: { type: "array", items: { type: "string", enum: ["c", "micropython", "xml", "esphome", "png", "json"] } }, lvgl: { type: "integer", enum: [8, 9, 96] } } },
    run: async a => {
      const P = live.project, out = path.join(DIR, slug(P.name) + "-export"), lv = [8, 9, 96].includes(a.lvgl) ? a.lvgl : P.lvgl || 9, made = [];
      const fmts = a.formats && a.formats.length ? a.formats : ["c", "micropython", "xml", "esphome", "png", "json"];
      const put = (rel, data) => { const f = path.join(out, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); made.push(rel); };
      if (fmts.includes("c")) { put("ui/ui.c", E.genC(P, { lvgl: lv })); put("ui/ui.h", E.genH(P)); const t = fs.readFileSync(path.join(editorDir, "assets", lv == 8 ? "lv_conf_v8.h" : lv == 96 ? "lv_conf_v96.h" : "lv_conf_v9.h"), "utf8"); put("ui/lv_conf.h", E.genLvConf(t, P, { memKB: Math.max(64, E.memoryReport(P).lvMemKB) })); }
      if (fmts.includes("micropython")) put("micropython/ui.py", E.genPy(P));
      if (fmts.includes("xml")) { E.genXML(P).forEach(x => put(`xml/${x.name}.xml`, x.xml)); put("xml/epixo_xml_init.c", E.genXMLLoader(P)); }
      if (fmts.includes("esphome")) put("esphome/epixo_ui.yaml", E.genYAML(P).yaml);
      if (fmts.includes("png")) for (const [i, s] of P.screens.entries()) put(`screens/${i + 1}-${E.ident(s.name).toLowerCase()}.png`, await renderScreen(P, s));
      if (fmts.includes("json")) put("project.epixo.json", JSON.stringify(P, null, 2));
      if (fmts.includes("c")) { put("live-mirror/epixo_rt.c", fs.readFileSync(path.join(runtimeDir, "epixo_rt.c"))); put("live-mirror/epixo_rt.h", fs.readFileSync(path.join(runtimeDir, "epixo_rt.h"))); }
      return { folder: out, files: made };
    } },
  { name: "show_in_editor", description: "Open the Epixo editor in the user's browser, linked live to this session so they can watch and edit along.", inputSchema: { type: "object", properties: {} },
    run: () => { openBrowser(URL_LIVE); return { ok: true, url: URL_LIVE, note: "Every change you make appears there instantly, and the user's edits come back to you." }; } },
  { name: "get_selection", description: "What the user is looking at in the editor right now: the open screen and the selected widget. Use it when they say 'this' or 'here'.", inputSchema: { type: "object", properties: {} },
    run: () => {
      const P = live.project, s = P.screens.find(x => x.id == live.view.screen) || P.screens.find(x => x.id == P.cur), w = s && s.widgets.find(x => x.id == live.view.selected);
      return { editorOpen: live.clients.size > 0, screen: s ? s.name : null, selected: w ? E.runTool(P, "get_screen", { screen: s.name }).widgets.find(x => x.name == w.name) : null };
    } },
];

const TOOLS = [...E.toolSpecs(), ...LOCAL_TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }))];

async function callTool(name, args) {
  const local = LOCAL_TOOLS.find(t => t.name == name);
  if (local) {
    const r = await local.run(args || {});
    if (local.image) return { content: [{ type: "image", data: r.png.toString("base64"), mimeType: "image/png" }, { type: "text", text: r.text }] };
    return { content: [{ type: "text", text: JSON.stringify(r, null, 1) }] };
  }
  const before = JSON.stringify(live.project);
  const r = E.runTool(live.project, name, args || {}, measure);
  if (!E.READ_ONLY[name] && JSON.stringify(live.project) !== before) { live.rev++; persist(); broadcast(E.toolNote(name, args)); }
  return { content: [{ type: "text", text: JSON.stringify(r, null, 1) }] };
}

const INSTRUCTIONS = `Epixo designs touch screens for ESP32 displays. Everything you build is real LVGL and exports to C, MicroPython, LVGL XML and ESPHome.
Start with get_project. Build whole screens with design_screen, then render_screen to look at the result, then check_design and fix_design.
The user can watch live at ${URL_LIVE} (call show_in_editor to open it). Their edits there come straight back to you, and get_selection tells you what they have selected.
${E.DESIGN_RULES}`;

/* ---------------- MCP (JSON-RPC 2.0) ---------------- */
const VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
async function handle(msg) {
  const { id, method, params } = msg || {};
  const reply = result => ({ jsonrpc: "2.0", id, result });
  const error = (code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
  if (!msg || msg.jsonrpc !== "2.0" || typeof method != "string") return error(-32600, "Invalid request");
  if (id === undefined) return null;
  try {
    if (method == "initialize") {
      const n = String(params?.clientInfo?.title || params?.clientInfo?.name || "");
      live.who = /claude/i.test(n) ? "Claude" : /chatgpt|openai/i.test(n) ? "ChatGPT" : /cursor/i.test(n) ? "Cursor" : /copilot|vscode|visual studio/i.test(n) ? "Copilot" : n ? n.slice(0, 24) : "AI";
    }
    if (method == "initialize") return reply({ protocolVersion: VERSIONS.includes(params?.protocolVersion) ? params.protocolVersion : VERSIONS[0], capabilities: { tools: { listChanged: false } }, serverInfo: { name: "epixo", title: "Epixo", version: VERSION }, instructions: INSTRUCTIONS });
    if (method == "ping") return reply({});
    if (method == "tools/list") return reply({ tools: TOOLS });
    if (method == "tools/call") {
      if (!TOOLS.some(t => t.name == params?.name)) return error(-32602, "Unknown tool " + params?.name);
      try { return reply(await callTool(params.name, params.arguments)); }
      catch (e) { return reply({ content: [{ type: "text", text: e && e.message ? e.message : String(e) }], isError: true }); }
    }
    if (method == "resources/list") return reply({ resources: [] });
    if (method == "prompts/list") return reply({ prompts: [] });
    return error(-32601, "Method not found: " + method);
  } catch (e) {
    return error(-32603, e && e.message ? e.message : "Internal error");
  }
}

function stdio() {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", async d => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n"); continue; }
      const out = Array.isArray(msg) ? (await Promise.all(msg.map(handle))).filter(Boolean) : await handle(msg);
      if (out && (!Array.isArray(out) || out.length)) process.stdout.write(JSON.stringify(out) + "\n");
    }
  });
  process.stdin.on("end", () => process.exit(0));
}

/* ---------------- live link and local editor ---------------- */
function broadcast(why, except) {
  const data = `event: project\ndata: ${JSON.stringify({ rev: live.rev, why: why || "", who: live.who, project: live.project })}\n\n`;
  for (const c of live.clients) if (c !== except) c.write(data);
}
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".png": "image/png", ".wasm": "application/wasm", ".json": "application/json", ".h": "text/plain; charset=utf-8", ".c": "text/plain; charset=utf-8", ".cpp": "text/plain; charset=utf-8" };
const HEADERS = { "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "cache-control": "no-store" };
const LOCAL_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`, `[::1]:${PORT}`]);

function readBody(req, max) {
  return new Promise((ok, no) => {
    let n = 0; const parts = [];
    req.on("data", c => { n += c.length; if (n > max) { no(new Error("too big")); req.destroy(); } else parts.push(c); });
    req.on("end", () => ok(Buffer.concat(parts).toString("utf8")));
  });
}
function editorPage() {
  let html = fs.readFileSync(path.join(editorDir, "index.html"), "utf8");
  html = html.replace('<script src="app.js"></script>', '<script src="app.js"></script>\n<script src="live.js"></script>');
  return '<!doctype html><html lang="en"><head>' + html.replace("</style>", "</style></head><body>") + "</body></html>";
}

function serve() {
  const srv = http.createServer(async (req, res) => {
    // Only this machine may talk to the live link, and only from the editor page itself.
    if (!LOCAL_HOSTS.has(req.headers.host || "")) { res.writeHead(403, HEADERS).end(); return; }
    const origin = req.headers.origin;
    if (req.method != "GET" && origin && !LOCAL_HOSTS.has(origin.replace(/^https?:\/\//, ""))) { res.writeHead(403, HEADERS).end(); return; }
    const url = new URL(req.url, URL_LIVE);
    try {
      if (url.pathname == "/live/events") {
        res.writeHead(200, { ...HEADERS, "content-type": "text/event-stream", connection: "keep-alive" });
        res.write(`event: project\ndata: ${JSON.stringify({ rev: live.rev, why: "", project: live.project })}\n\n`);
        res.client = url.searchParams.get("client") || "";
        live.clients.add(res);
        const beat = setInterval(() => res.write(": beat\n\n"), 20000);
        req.on("close", () => { clearInterval(beat); live.clients.delete(res); });
        return;
      }
      if (url.pathname == "/live/project" && req.method == "PUT") {
        const p = load2(await readBody(req, 2_000_000));
        if (JSON.stringify(p) !== JSON.stringify(live.project)) {
          // The editor opened a different project, so it gets its own file.
          if (p.pid !== live.project.pid) { let f = fileOf(p.name); for (let i = 2; fs.existsSync(f) && f !== live.file; i++) f = fileOf(p.name + " " + i); live.file = f; }
          live.project = p; live.rev++; persist();
          const from = req.headers["x-epixo-client"] || "";
          broadcast("Changed in another window", [...live.clients].find(c => c.client && c.client === from));
        }
        res.writeHead(200, { ...HEADERS, "content-type": "application/json" }).end(JSON.stringify({ rev: live.rev }));
        return;
      }
      if (url.pathname == "/live/view" && req.method == "PUT") {
        const v = JSON.parse(await readBody(req, 2000));
        live.view = { screen: typeof v.screen == "string" ? v.screen : null, selected: typeof v.selected == "string" ? v.selected : null };
        res.writeHead(204, HEADERS).end();
        return;
      }
      if (req.method != "GET") { res.writeHead(405, HEADERS).end(); return; }
      if (url.pathname == "/" || url.pathname == "/index.html") { res.writeHead(200, { ...HEADERS, "content-type": TYPES[".html"] }).end(editorPage()); return; }
      const rel = url.pathname.startsWith("/runtime/") ? path.join(runtimeDir, path.basename(url.pathname)) : path.join(editorDir, path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, ""));
      if (!rel.startsWith(editorDir) && !rel.startsWith(runtimeDir)) { res.writeHead(404, HEADERS).end(); return; }
      const data = fs.readFileSync(rel);
      res.writeHead(200, { ...HEADERS, "content-type": TYPES[path.extname(rel)] || "application/octet-stream" }).end(data);
    } catch {
      res.writeHead(404, HEADERS).end();
    }
  });
  srv.on("error", e => log(e.code == "EADDRINUSE" ? `port ${PORT} is busy, so the live editor is off for this session (set EPIXO_PORT to use another)` : e.message));
  srv.listen(PORT, "127.0.0.1", () => log(`live editor at ${URL_LIVE}, projects in ${DIR}`));
}
function load2(text) {
  const p = JSON.parse(text);
  if (!p || !p.board || !Array.isArray(p.screens) || !p.screens.length) throw new Error("bad project");
  return p;
}
function openBrowser(url) {
  const cmd = process.platform == "darwin" ? ["open", [url]] : process.platform == "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  try { spawn(cmd[0], cmd[1], { stdio: "ignore", detached: true }).unref(); } catch {}
}

startup();
if (!process.argv.includes("--no-editor")) serve();
stdio();
