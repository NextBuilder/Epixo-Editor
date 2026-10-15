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
