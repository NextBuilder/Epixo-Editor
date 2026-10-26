import { z } from "zod";
import core, { type Project } from "@/data/epixo-core.cjs";
import { readProject } from "./project";
import { all, first, newId, now, run, sha256 } from "./server";

// Remote MCP for AI apps that connect over the internet (claude.ai, ChatGPT, Claude Code).
// Each connection has a secret link; the AI edits the maker's saved projects and the open editor picks the changes up.

export const TOKEN_PREFIX = "epx_";
const VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

export type Connection = { id: string; user_id: string; label: string; project_id: string | null; client: string };

export async function connectionFor(token: string) {
  if (!token.startsWith(TOKEN_PREFIX) || token.length < 30 || token.length > 80) return null;
  return first<Connection>("SELECT id, user_id, label, project_id, client FROM ai_connections WHERE token_hash = ?", await sha256(token));
}

export async function createConnection(userId: string, label: string) {
  const token = TOKEN_PREFIX + newId(40);
  const id = newId(12);
  await run("INSERT INTO ai_connections (id, token_hash, user_id, label, created_at) VALUES (?, ?, ?, ?, ?)", id, await sha256(token), userId, label, now());
  return { id, token };
}

const Rpc = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string().max(200), z.number()]).optional(),
  method: z.string().max(100),
  params: z.record(z.string(), z.unknown()).optional(),
});
const Call = z.object({ name: z.string().max(64), arguments: z.record(z.string(), z.unknown()).optional() });

const PROJECT_TOOLS = [
  { name: "list_projects", description: "The maker's saved Epixo projects, newest first. The newest is usually the one open in their editor.", inputSchema: { type: "object", properties: {} } },
  { name: "open_project", description: "Work on another saved project, by name or id.", inputSchema: { type: "object", properties: { project: { type: "string" } }, required: ["project"] } },
  { name: "new_project", description: "Start a new project on a board (id from find_boards), optionally from a template. It keeps the current board if you leave it out.", inputSchema: { type: "object", properties: { name: { type: "string" }, board: { type: "string" }, rotated: { type: "boolean" }, template: { type: "string", enum: Object.keys(core.TPL) } }, required: ["name"] } },
];
const TOOLS = [...PROJECT_TOOLS, ...core.toolSpecs()];

const INSTRUCTIONS = `Epixo designs touch screens for ESP32 displays. Everything you build is real LVGL and exports to C, MicroPython, LVGL XML and ESPHome.
Start with get_project. Build whole screens with design_screen, use get_screen to see the layout as a text map, then check_design and fix_design.
Your changes are saved to the maker's Epixo account and appear in their open editor within a few seconds, where every change can be undone.
${core.DESIGN_RULES}`;

const who = (client: string) => (/claude/i.test(client) ? "Claude" : /chatgpt|openai/i.test(client) ? "ChatGPT" : /cursor/i.test(client) ? "Cursor" : client ? client.slice(0, 24) : "AI");

async function loadProject(c: Connection): Promise<{ id: string; p: Project } | null> {
  const row = c.project_id
    ? await first<{ id: string; json: string }>("SELECT id, json FROM projects WHERE id = ? AND owner_id = ?", c.project_id, c.user_id)
    : await first<{ id: string; json: string }>("SELECT id, json FROM projects WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 1", c.user_id);
  if (!row) return null;
  const p = JSON.parse(row.json) as Project;
  p.pid = row.id;
  return { id: row.id, p };
}

async function saveProject(c: Connection, id: string, p: Project, note: string, isNew = false) {
  const text = JSON.stringify(p);
  const meta = readProject(text);
  if (!meta) throw new Error("The project grew past the 600 KB limit. Remove some screens and try again.");
  const t = now();
  if (isNew) {
    const count = await first<{ n: number }>("SELECT COUNT(*) AS n FROM projects WHERE owner_id = ?", c.user_id);
    if ((count?.n ?? 0) >= 500) throw new Error("This account has 500 saved projects. Delete some to start new ones.");
    await run("INSERT INTO projects (id, owner_id, name, board_id, board_label, w, h, screens, json, created_at, updated_at, updated_by, update_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", id, c.user_id, meta.name, meta.boardId, meta.boardLabel, meta.w, meta.h, meta.screens, text, t, t, who(c.client), note);
  } else {
    await run("UPDATE projects SET name = ?, board_id = ?, board_label = ?, w = ?, h = ?, screens = ?, json = ?, updated_at = ?, updated_by = ?, update_note = ? WHERE id = ? AND owner_id = ?", meta.name, meta.boardId, meta.boardLabel, meta.w, meta.h, meta.screens, text, t, who(c.client), note, id, c.user_id);
  }
}


async function callTool(c: Connection, name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === "list_projects") {
    return { projects: await all("SELECT id, name, board_label AS board, screens, datetime(updated_at, 'unixepoch') AS updated FROM projects WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 50", c.user_id) };
  }
  if (name === "open_project") {
    const q = String(args.project ?? "").slice(0, 80);
    const row = await first<{ id: string; name: string }>("SELECT id, name FROM projects WHERE owner_id = ? AND (id = ? OR lower(name) = lower(?)) ORDER BY updated_at DESC LIMIT 1", c.user_id, q, q);
    if (!row) throw new Error(`No project called "${q}". Use list_projects.`);
    await run("UPDATE ai_connections SET project_id = ? WHERE id = ?", row.id, c.id);
    c.project_id = row.id;
    const l = await loadProject(c);
    return core.runTool(l!.p, "get_project", {});
  }
  if (name === "new_project") {
    const cur = await loadProject(c);
    const b0 = typeof args.board === "string" ? core.BOARDS.find(b => b.id === args.board) : cur?.p.board ?? core.BOARDS[0];
    if (!b0) throw new Error(`No board with id "${String(args.board)}". Use find_boards.`);
    const b = typeof args.board === "string" ? core.withRotation(b0, args.rotated ? 90 : 0) : b0;
    const p = core.blank(b);
    p.name = String(args.name ?? "Untitled UI").slice(0, 60) || "Untitled UI";
    const key = typeof args.template === "string" && core.TPL[args.template] ? args.template : null;
    p.cur = key ? core.addTemplate(p, key, b.w, b.h, b.round)[0].id : core.mkScreen(p, "Home").id;
    const id = newId(12);
    p.pid = id;
    await saveProject(c, id, p, `Started ${p.name}`, true);
    await run("UPDATE ai_connections SET project_id = ? WHERE id = ?", id, c.id);
    return { ...(core.runTool(p, "get_project", {}) as object), editorLink: `/editor?open=${id}` };
  }
  const l = await loadProject(c);
  if (!l) throw new Error("This account has no saved projects yet. Call new_project to start one.");
  const before = JSON.stringify(l.p);
  const out = core.runTool(l.p, name, args);
  if (!core.READ_ONLY[name] && JSON.stringify(l.p) !== before) await saveProject(c, l.id, l.p, core.toolNote(name, args));
  return out;
}

// Handles one JSON-RPC message. Returns null for notifications, which get no reply.
export async function handleRpc(c: Connection, raw: unknown) {
  const parsed = Rpc.safeParse(raw);
  if (!parsed.success) return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request" } };
  const { id, method, params } = parsed.data;
  if (id === undefined) return null;
  const reply = (result: unknown) => ({ jsonrpc: "2.0", id, result });
  const error = (code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });
  if (method === "initialize") {
    const info = (params?.clientInfo ?? {}) as { name?: unknown; title?: unknown };
    const client = String(info.title ?? info.name ?? "").slice(0, 40);
    if (client !== c.client) await run("UPDATE ai_connections SET client = ? WHERE id = ?", client, c.id);
    const v = typeof params?.protocolVersion === "string" && VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : VERSIONS[0];
    return reply({ protocolVersion: v, capabilities: { tools: { listChanged: false } }, serverInfo: { name: "epixo", title: "Epixo", version: "0.6.0" }, instructions: INSTRUCTIONS });
  }
  if (method === "ping") return reply({});
  if (method === "tools/list") return reply({ tools: TOOLS });
  if (method === "resources/list") return reply({ resources: [] });
  if (method === "prompts/list") return reply({ prompts: [] });
  if (method === "tools/call") {
    const call = Call.safeParse(params);
    if (!call.success || !TOOLS.some(t => t.name === call.data.name)) return error(-32602, "Unknown tool");
    try {
      const out = await callTool(c, call.data.name, call.data.arguments ?? {});
      return reply({ content: [{ type: "text", text: JSON.stringify(out, null, 1) }] });
    } catch (e) {
      return reply({ content: [{ type: "text", text: e instanceof Error ? e.message : "Something went wrong." }], isError: true });
    }
  }
  return error(-32601, "Method not found");
}
