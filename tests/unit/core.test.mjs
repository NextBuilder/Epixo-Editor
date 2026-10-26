import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const E = createRequire(import.meta.url)("../../apps/editor/core.js");
const templates = Object.keys(E.TPL);
const bad = /\bundefined\b|\bNaN\b|\[object Object\]/;

function project(board, tpl) {
  const p = E.blank(board);
  p.name = `${tpl} ${board.id}`;
  const screens = E.addTemplate(p, tpl, board.w, board.h, board.round);
  p.cur = screens[0].id;
  return p;
}

function exportsOf(p) {
  const xml = E.genXML(p);
  return {
    script: E.toScript(p),
    c8: E.genC(p, { lvgl: 8 }),
    c9: E.genC(p, { lvgl: 9 }),
    c96: E.genC(p, { lvgl: 96 }),
    h: E.genH(p),
    py: E.genPy(p),
    xml: xml.map(x => x.xml).join("\n"),
    yaml: E.genYAML(p).yaml,
  };
}

test("every board has complete, unique data", () => {
  assert.ok(E.BOARDS.length >= 100);
  assert.equal(new Set(E.BOARDS.map(b => b.id)).size, E.BOARDS.length);
  for (const b of E.BOARDS) {
    assert.ok(b.brand && b.name && b.chip, `board ${b.id} is missing a name, brand or chip`);
    assert.ok(Number.isInteger(b.w) && b.w > 0 && Number.isInteger(b.h) && b.h > 0, `board ${b.id} has bad dimensions`);
  }
});

test("every template exports cleanly on every board", () => {
  for (const b of E.BOARDS) {
    for (const t of templates) {
      const out = exportsOf(project(b, t));
      for (const [kind, text] of Object.entries(out)) {
        assert.ok(text.length > 0, `${t} on ${b.id}: empty ${kind}`);
        assert.doesNotMatch(text, bad, `${t} on ${b.id}: ${kind} contains a broken value`);
      }
    }
  }
});

test("rotated boards swap width and height", () => {
  const b = E.BOARDS.find(x => x.w !== x.h);
  const r = E.withRotation(b, 90);
  assert.equal(r.w, b.h);
  assert.equal(r.h, b.w);
});

test("generated C has one create function per screen", () => {
  const b = E.BOARDS[0];
  for (const t of templates) {
    const p = project(b, t);
    const c = E.genC(p, { lvgl: 9 });
    for (const s of p.screens) assert.ok(c.includes(E.sid(s.id)), `${t}: screen ${s.name} missing from C`);
  }
});

test("Design Doctor returns well-formed findings and fixes apply", () => {
  for (const b of E.BOARDS.slice(0, 20)) {
    for (const t of templates) {
      const p = project(b, t);
      const found = E.doctor(p);
      assert.ok(Array.isArray(found));
      for (const f of found) {
        assert.ok(["error", "warn", "info"].includes(f.sev), `unknown severity ${f.sev}`);
        assert.ok(typeof f.msg === "string" && f.msg.length > 0);
      }
    }
  }
});

test("text with quotes and backslashes is escaped in C", () => {
  const b = E.BOARDS[0];
  const p = E.blank(b);
  const s = E.mkScreen(p, "Main", "#FFFFFF");
  s.widgets.push(E.mkW(p, "label", { x: 0, y: 0, w: 200, h: 40, text: 'Say "hi" \\ bye' }));
  p.cur = s.id;
  const c = E.genC(p, { lvgl: 9 });
  assert.ok(c.includes('Say \\"hi\\" \\\\ bye'));
});

test("identifiers are valid C names", () => {
  for (const name of ["Main", "2nd screen", "Ünïcode name", "a-b c"]) {
    assert.match(E.ident(name), /^[A-Za-z_][A-Za-z0-9_]*$/, `ident(${JSON.stringify(name)})`);
  }
});

test("screen names never collide in generated code", () => {
  const p = E.blank(E.BOARDS[0]);
  for (const n of ["Home 1", "Home-1", "home_1", "", "日本", "中文"]) E.mkScreen(p, n);
  const keys = p.screens.map(s => E.nameKey(s.name));
  assert.equal(new Set(keys).size, keys.length, keys.join(", "));
  assert.ok(keys.every(k => /^[a-z_][a-z0-9_]*$/.test(k)));
});

test("duplicate widget names are caught and fixed by Design Doctor", () => {
  const p = E.blank(E.BOARDS[0]);
  const s = E.mkScreen(p, "Main");
  s.widgets.push(E.mkW(p, "label", { name: "Title", x: 0, y: 0, w: 100, h: 30 }));
  s.widgets.push(E.mkW(p, "label", { name: "title", x: 0, y: 40, w: 100, h: 30 }));
  const dup = E.doctor(p).find(f => f.code === "dupname");
  assert.ok(dup, "duplicate not reported");
  assert.ok(E.applyFix(p, dup));
  assert.equal(E.doctor(p).filter(f => f.code === "dupname").length, 0);
  assert.equal(E.uniqueWidgetName(s, "Title", null), "Title3");
});

test("no template has colliding text on any board or rotation", () => {
  for (const b0 of E.BOARDS) {
    for (const rot of [0, 90]) {
      const b = E.withRotation(b0, rot);
      for (const t of templates) {
        const hits = E.doctor(project(b, t)).filter(f => f.code === "overlap");
        assert.equal(hits.length, 0, `${t} on ${b.id} at ${rot}°: ${hits.map(h => h.msg).join("; ")}`);
      }
    }
  }
});

test("Design Doctor warns when text overlaps", () => {
  const p = E.blank(E.BOARDS[0]);
  const s = E.mkScreen(p, "Main");
  s.widgets.push(E.mkW(p, "label", { x: 10, y: 10, w: 200, h: 40, text: "One" }));
  s.widgets.push(E.mkW(p, "label", { x: 20, y: 20, w: 200, h: 40, text: "Two" }));
  assert.equal(E.doctor(p).filter(f => f.code === "overlap").length, 1);
});

test("actions become firmware hooks in every format", () => {
  const p = E.defaultProject(), s = p.screens[0];
  const add = (t, pr) => { const w = E.mkW(p, t, pr); s.widgets.push(w); return w; };
  add("button", { x: 10, y: 10, w: 100, h: 40, action: "Lights On!" });
  add("slider", { x: 10, y: 60, w: 200, h: 10, action: "dim" });
  add("label", { x: 10, y: 90, w: 100, h: 30, action: "lights_on" });
  add("bar", { x: 10, y: 130, w: 100, h: 10, action: "ignored" });
  assert.deepEqual(E.actionsOf(p), ["lights_on", "dim"]);

  const h = E.genH(p), c = E.genC(p, { lvgl: 9 }), c8 = E.genC(p, { lvgl: 8 });
  assert.match(h, /void ui_action_lights_on\(lv_event_t \* e\);/);
  for (const code of [c, c8]) {
    assert.equal(code.match(/UI_WEAK void ui_action_lights_on\(/g).length, 1, "one default per action");
    assert.match(code, /lv_obj_add_event_cb\(ui_Home_Slider\d+, ui_action_dim, LV_EVENT_VALUE_CHANGED, NULL\);/);
    assert.match(code, /lv_obj_add_flag\(ui_Home_Label\d+, LV_OBJ_FLAG_CLICKABLE\);\n    lv_obj_add_event_cb\(ui_Home_Label\d+, ui_action_lights_on, LV_EVENT_CLICKED/);
  }
  assert.doesNotMatch(c + h, /ignored/);
  assert.match(E.genPy(p), /add_event_cb\(run_action\("dim"\), lv\.EVENT\.VALUE_CHANGED, None\)/);
  assert.match(E.genXML(p).map(x => x.xml).join(""), /<event_cb trigger="value_changed" callback="ui_action_dim"\/>/);
  assert.match(E.genXMLLoader(p), /lv_xml_register_event_cb\(NULL, "ui_action_dim", ui_action_dim\);/);
  const y = E.genYAML(p).yaml;
  assert.match(y, /on_value:\n\s+- script\.execute: action_dim/);
  assert.match(y, /script:\n  - id: action_lights_on\n/);
  assert.match(E.actionGuide(p), /void ui_action_dim\(lv_event_t \* e\)/);
});

test("action names are safe C identifiers", () => {
  assert.equal(E.actionName("  Turn ON the fan "), "turn_on_the_fan");
  assert.equal(E.actionName("3d print"), "_3d_print");
  assert.equal(E.actionName("!!!"), "");
  assert.equal(E.actionName("a".repeat(50)).length, 32);
  const [, w] = E.cleanWidget(E.BOARDS[0], { type: "button", x: 0, y: 0, w: 50, h: 30, action: "x(); system()" });
  assert.equal(w.action, "x_system");
});
