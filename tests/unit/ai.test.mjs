import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const E = createRequire(import.meta.url)("../../apps/editor/core.js");
const fresh = () => E.defaultProject();

test("every tool has a name, description and object schema", () => {
  const names = new Set();
  for (const t of E.toolSpecs()) {
    assert.match(t.name, /^[a-z_]{3,40}$/);
    assert.ok(!names.has(t.name), `${t.name} is listed twice`);
    names.add(t.name);
    assert.ok(t.description.length > 20);
    assert.equal(t.inputSchema.type, "object");
  }
});

test("design_screen builds a clean new screen and opens it", () => {
  const p = fresh();
  const before = p.screens.length;
  const r = E.runTool(p, "design_screen", {
    name: "Plant",
    background: "#f2f3f7",
    widgets: [
      { type: "card", x: 20, y: 20, w: 300, h: 200 },
      { type: "label", name: "Title", x: 40, y: 30, w: 260, h: 40, text: "Soil moisture", font: 24 },
      { type: "gauge", x: 60, y: 80, w: 120, h: 140, value: 40 },
    ],
  });
  assert.equal(p.screens.length, before + 1);
  const s = p.screens.find(x => x.name === "Plant");
  assert.equal(p.cur, s.id);
  assert.equal(s.bg, "#F2F3F7");
  assert.deepEqual(s.widgets.map(w => w.type), ["panel", "label", "arc"]);
  assert.equal(s.widgets[2].w, s.widgets[2].h, "arcs stay square");
  assert.deepEqual(r.widgets, s.widgets.map(w => w.name));
  assert.ok(E.genC(p, { lvgl: 9 }).includes("ui_Plant_Title"));
});

test("design_screen with replace swaps the widgets of an existing screen", () => {
  const p = fresh();
  const s = p.screens[0];
  E.runTool(p, "design_screen", { name: s.name, replace: true, widgets: [{ type: "button", x: 10, y: 10, w: 120, h: 50, text: "Go" }] });
  assert.equal(p.screens[0].widgets.length, 1);
  assert.equal(p.screens[0].id, s.id);
});

test("unknown widget types are refused with a helpful message", () => {
  assert.throws(() => E.runTool(fresh(), "add_widgets", { widgets: [{ type: "hologram", x: 0, y: 0, w: 10, h: 10 }] }), /Use one of/);
});

test("update_widgets changes only what it is given and links screens", () => {
  const p = fresh();
  E.runTool(p, "manage_screen", { action: "add", name: "Details" });
  const home = p.screens[0];
  const [name] = E.runTool(p, "add_widgets", { screen: home.name, widgets: [{ type: "button", x: 20, y: 20, w: 140, h: 50, text: "Open" }] }).added;
  const before = { ...home.widgets.find(w => w.name === name) };
  E.runTool(p, "update_widgets", { screen: home.name, changes: [{ target: name, text: "More", onTap: "Details", animation: "fade" }] });
  const w = home.widgets.find(x => x.name === name);
  assert.equal(w.text, "More");
  assert.equal(w.x, before.x);
  assert.equal(w.onTap.to, p.screens.find(s => s.name === "Details").id);
  assert.equal(w.onTap.anim, "fade");
  E.runTool(p, "update_widgets", { screen: home.name, changes: [{ target: name, onTap: "" }] });
  assert.equal(w.onTap, null);
});

test("widget names stay unique when the AI asks for a taken name", () => {
  const p = fresh();
  const r = E.runTool(p, "add_widgets", { widgets: [{ type: "label", name: "Title", x: 0, y: 0, w: 50, h: 20 }, { type: "label", name: "Title", x: 0, y: 30, w: 50, h: 20 }] });
  assert.notEqual(r.added[0].toLowerCase(), r.added[1].toLowerCase());
});

test("arrange_widgets centres and distributes", () => {
  const p = fresh();
  E.runTool(p, "manage_screen", { action: "add", name: "Row" });
  const names = E.runTool(p, "add_widgets", { widgets: [0, 1, 2].map(i => ({ type: "button", x: i * 70, y: 10, w: 60, h: 40 })) }).added;
  E.runTool(p, "arrange_widgets", { names: [names[0]], align: "center" });
  const s = p.screens.find(x => x.name === "Row");
  const a = s.widgets.find(w => w.name === names[0]);
  assert.equal(a.x, Math.round((p.board.w - a.w) / 2));
  E.runTool(p, "arrange_widgets", { names, distribute: "horizontal" });
  const xs = names.map(n => s.widgets.find(w => w.name === n)).sort((q, r) => q.x - r.x);
  assert.ok(Math.abs((xs[1].x - xs[0].x) - (xs[2].x - xs[1].x)) <= 1);
});

test("deleting a screen removes links to it", () => {
  const p = fresh();
  const linked = p.screens.flatMap(s => s.widgets).find(w => w.onTap && w.onTap.to);
  assert.ok(linked, "the default project has links");
  const target = p.screens.find(s => s.id === linked.onTap.to);
  E.runTool(p, "manage_screen", { action: "delete", screen: target.name });
  assert.equal(linked.onTap, null);
  assert.equal(E.doctor(p, E.measureText).filter(i => i.code === "deadlink").length, 0);
});

test("set_board adapts every screen to a round display", () => {
  const p = fresh();
  const round = E.BOARDS.find(b => b.round);
  E.runTool(p, "set_board", { board: round.id });
  assert.equal(p.board.id, round.id);
  for (const s of p.screens) for (const w of s.widgets) {
    assert.ok(w.x >= 0 && w.y >= 0 && w.x + w.w <= round.w && w.y + w.h <= round.h, `${w.name} left the screen`);
  }
});

test("fix_design leaves no automatic errors", () => {
  const p = fresh();
  E.runTool(p, "add_widgets", { widgets: [{ type: "button", x: 5, y: 5, w: 20, h: 12, text: "A very long button label" }] });
  E.runTool(p, "fix_design", {});
  const left = E.runTool(p, "check_design", {}).problems.filter(i => i.severity === "error" && i.autoFix);
  assert.deepEqual(left, []);
});

test("get_screen gives a text map with one legend line per visible widget", () => {
  const p = fresh();
  const r = E.runTool(p, "get_screen", {});
  const visible = p.screens[0].widgets.filter(w => !w.hidden).length;
  assert.equal(r.layout.legend.length, visible);
  assert.ok(r.layout.map.split("\n").every(l => l.length === 48));
});

test("apply_theme restyles every screen and get_code returns code", () => {
  const p = fresh();
  E.runTool(p, "apply_theme", { theme: "Midnight", all: true });
  assert.ok(p.screens.every(s => s.bg === "#0B0D12"));
  assert.match(E.runTool(p, "get_code", { format: "c", lvgl: 8 }).code, /lv_obj_create/);
  assert.ok(E.runTool(p, "get_code", { format: "xml" }).files.length === p.screens.length);
});

test("read-only tools do not change the project", () => {
  const p = fresh();
  const before = JSON.stringify(p);
  for (const name of Object.keys(E.READ_ONLY)) E.runTool(p, name, name === "get_code" ? { format: "c" } : {});
  assert.equal(JSON.stringify(p), before);
});
