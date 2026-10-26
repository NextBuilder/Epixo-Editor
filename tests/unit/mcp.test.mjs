import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const server = path.resolve(import.meta.dirname, "../../apps/mcp/server.mjs");

function start(port) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "epixo-mcp-"));
  const args = port ? [server] : [server, "--no-editor"];
  const child = spawn(process.execPath, args, { env: { ...process.env, EPIXO_DIR: dir, EPIXO_PORT: String(port || 0) }, stdio: ["pipe", "pipe", "pipe"] });
  const waiting = new Map();
  let buf = "", next = 1;
  child.stdout.on("data", d => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1);
      waiting.get(m.id)?.(m); waiting.delete(m.id);
    }
  });
  const rpc = (method, params) => new Promise(ok => { const id = next++; waiting.set(id, ok); child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); });
  const call = async (name, args) => (await rpc("tools/call", { name, arguments: args })).result;
  const ready = port ? new Promise(ok => child.stderr.on("data", d => String(d).includes("live editor") && ok())) : Promise.resolve();
  return { child, dir, rpc, call, ready, stop: () => child.kill() };
}

test("the MCP server introduces itself and lists its tools", async () => {
  const s = start();
  try {
    const init = await s.rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "claude-ai", version: "1" } });
    assert.equal(init.result.protocolVersion, "2025-06-18");
    assert.equal(init.result.serverInfo.name, "epixo");
    assert.ok(init.result.instructions.includes("design_screen"));
    const old = await s.rpc("initialize", { protocolVersion: "1999-01-01" });
    assert.equal(old.result.protocolVersion, "2025-06-18");
    const { tools } = (await s.rpc("tools/list")).result;
    for (const n of ["get_project", "design_screen", "render_screen", "new_project", "export_project", "get_selection"]) assert.ok(tools.some(t => t.name === n), `missing ${n}`);
    assert.equal((await s.rpc("nope")).error.code, -32601);
  } finally { s.stop(); }
});

test("tools change the project on disk and render real PNGs", async () => {
  const s = start();
  try {
    await s.rpc("initialize", {});
    const np = await s.call("new_project", { name: "Bike computer", template: "fitness" });
    assert.ok(!np.isError, np.content[0].text);
    const d = await s.call("design_screen", { name: "Ride", background: "#101114", widgets: [{ type: "label", x: 20, y: 20, w: 200, h: 40, text: "32 km/h", fg: "#FFFFFF", font: 32 }] });
    assert.ok(!d.isError, d.content[0].text);
    const saved = JSON.parse(fs.readFileSync(path.join(s.dir, "bike-computer.epixo.json"), "utf8"));
    assert.ok(saved.screens.some(x => x.name === "Ride"));
    const img = await s.call("render_screen", { screen: "Ride" });
    assert.equal(img.content[0].type, "image");
    assert.equal(Buffer.from(img.content[0].data, "base64").subarray(1, 4).toString(), "PNG");
    const bad = await s.call("update_widgets", { changes: [{ target: "Nobody", text: "x" }] });
    assert.equal(bad.isError, true);
    const ex = JSON.parse((await s.call("export_project", { formats: ["c", "json"] })).content[0].text);
    assert.ok(fs.existsSync(path.join(ex.folder, "ui", "ui.c")));
  } finally { s.stop(); }
});

test("the live link serves the editor and streams changes", async () => {
  const port = 17457 + Math.floor(Math.random() * 1000);
  const s = start(port);
  try {
    await s.ready;
    const page = await (await fetch(`http://localhost:${port}/`)).text();
    assert.ok(page.includes('<script src="live.js"></script>'));
    assert.equal((await fetch(`http://localhost:${port}/../../package.json`)).status, 404);
    assert.equal((await fetch(`http://127.0.0.1:${port}/live/project`, { method: "PUT", headers: { origin: "https://evil.example" }, body: "{}" })).status, 403);
    const ctl = new AbortController();
    const events = await fetch(`http://localhost:${port}/live/events`, { signal: ctl.signal });
    const reader = events.body.getReader();
    const firstEvent = new TextDecoder().decode((await reader.read()).value);
    assert.match(firstEvent, /^event: project/);
    await s.rpc("initialize", { clientInfo: { name: "ChatGPT" } });
    await s.call("manage_screen", { action: "add", name: "Live test" });
    let got = "";
    while (!got.includes("Live test")) got += new TextDecoder().decode((await reader.read()).value);
    assert.ok(got.includes('"who":"ChatGPT"'));
    ctl.abort();
  } finally { s.stop(); }
});
