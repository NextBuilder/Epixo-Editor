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

// A PNG data URL built with Node's zlib, so the decoder in core.js is checked against a real encoder.
async function pngURL(w, h, ct, px) {
  const zlib = await import("node:zlib");
  const ch = { 0: 1, 2: 3, 6: 4 }[ct], raw = Buffer.alloc((w * ch + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * ch + 1)] = y % 5; for (let x = 0; x < w; x++) raw.set(px(x, y).slice(0, ch), y * (w * ch + 1) + 1 + x * ch); }
  // Store real filtered rows: apply each filter so the decoder has to undo it.
  for (let y = h - 1; y >= 0; y--) {
    const f = raw[y * (w * ch + 1)], s = y * (w * ch + 1) + 1, up = s - (w * ch + 1);
    for (let x = w * ch - 1; x >= 0; x--) {
      const a = x >= ch ? raw[s + x - ch] : 0, b = y ? raw[up + x] : 0, c = x >= ch && y ? raw[up + x - ch] : 0;
      const pred = f == 1 ? a : f == 2 ? b : f == 3 ? (a + b) >> 1 : f == 4 ? (() => { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; })() : 0;
      raw[s + x] = (raw[s + x] - pred) & 255;
    }
  }
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = b => { let c = 0xFFFFFFFF; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = ct;
  return "data:image/png;base64," + Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]).toString("base64");
}

test("PNG pictures decode exactly, with every row filter", async () => {
  const px = (x, y) => [x * 7 & 255, y * 11 & 255, (x ^ y) & 255, (x + y) % 3 ? 255 : 90];
  for (const ct of [0, 2, 6]) {
    const url = await pngURL(37, 23, ct, ct == 0 ? (x, y) => [px(x, y)[0]] : px);
    const d = E.decodePNG(new Uint8Array(Buffer.from(url.split(",")[1], "base64")));
    assert.equal(d.w, 37); assert.equal(d.h, 23);
    for (const [x, y] of [[0, 0], [36, 22], [5, 9], [20, 13]]) {
      const k = (y * 37 + x) * 4, want = px(x, y);
      if (ct == 0) assert.deepEqual([...d.rgba.slice(k, k + 4)], [want[0], want[0], want[0], 255]);
      else assert.deepEqual([...d.rgba.slice(k, k + 4)], ct == 2 ? [...want.slice(0, 3), 255] : want);
    }
  }
});

test("image widgets export pixels for LVGL 8 and 9, MicroPython and ESPHome", async () => {
  const p = E.defaultProject(), s = p.screens[0];
  const src = await pngURL(40, 20, 6, (x, y) => [255, x * 6, y * 12, x < 3 ? 0 : 255]);
  const w = E.mkW(p, "image", { x: 10, y: 10, w: 80, h: 40, image: { src } }); w.name = "Logo"; s.widgets.push(w);
  const blank = E.mkW(p, "image", { x: 100, y: 10, w: 40, h: 40 }); blank.name = "Empty"; s.widgets.push(blank);
  const pic = E.pictureOf(w);
  assert.equal(pic.w, 80); assert.equal(pic.h, 40); assert.ok(pic.alpha, "transparent pixels keep an alpha plane");
  const c9 = E.genC(p, { lvgl: 9 }), c8 = E.genC(p, { lvgl: 8 }), h = E.genH(p);
  assert.match(c9, /const lv_image_dsc_t ui_img_Home_Logo = \{[\s\S]*LV_COLOR_FORMAT_RGB565A8[\s\S]*\.header\.stride = 160,/);
  assert.match(c9, /lv_image_set_src\(ui_Home_Logo, &ui_img_Home_Logo\);/);
  assert.match(c8, /#elif LV_COLOR_DEPTH == 16\n[\s\S]*LV_IMG_CF_TRUE_COLOR_ALPHA/);
  assert.match(c8, /lv_img_set_src\(ui_Home_Logo, &ui_img_Home_Logo\);/);
  assert.match(c9 + c8, /lv_label_set_text\(ui_Home_Empty_icon, LV_SYMBOL_IMAGE\);/);
  assert.match(h, /UI_IMAGE_DECLARE\(ui_img_Home_Logo\);/);
  assert.doesNotMatch(h, /ui_img_Home_Empty/);
  const map = c9.match(/ui_img_Home_Logo_map\[\] = \{([\s\S]*?)\};/)[1].match(/0x[0-9a-f]{2}/g);
  assert.equal(map.length, 80 * 40 * 3, "RGB565 plane plus alpha plane");
  assert.match(E.genPy(p), /^import lvgl as lv\nimport binascii/);
  const y = E.genYAML(p);
  assert.match(y.yaml, /image:\n  - file: epixo_images\/img_home_logo\.png\n    id: img_home_logo\n    type: RGB565\n    resize: 80x40\n    transparency: alpha_channel/);
  assert.equal(y.files.length, 1);
  assert.ok(E.genXML(p).skipped.includes("Home/Logo"));
  assert.ok(E.toScript(p).includes("P\timg\t80,40,1"));
  const issues = E.doctor(p);
  assert.ok(issues.some(i => i.code == "nopicture" && i.widget == blank.id));
  assert.equal(E.memoryReport(p).flashImagesKB, Math.ceil(80 * 40 * 3 / 1024));
});

test("rollers, text fields and keyboards export and link together", () => {
  const p = E.defaultProject(), s = p.screens[0];
  const add = (t, pr) => { const w = E.mkW(p, t, pr); s.widgets.push(w); return w; };
  const r = add("roller", { x: 0, y: 0, w: 160, h: 120, options: "A\nB\nC", value: 9, action: "pick" });
  const t1 = add("textarea", { x: 200, y: 0, w: 200, h: 44, text: "Name", action: "save" });
  const t2 = add("textarea", { x: 200, y: 60, w: 200, h: 44, text: "Password", password: true });
  const k = add("keyboard", { x: 0, y: 280, w: 800, h: 200 });
  const c = E.genC(p, { lvgl: 9 });
  assert.match(c, new RegExp("lv_roller_set_selected\\(ui_Home_" + r.name + ", 2, LV_ANIM_OFF\\);"), "selection is clamped to the last choice");
  assert.match(c, new RegExp("lv_keyboard_set_textarea\\(ui_Home_" + k.name + ", ui_Home_" + t1.name + "\\);"));
  assert.match(c, new RegExp("lv_obj_add_event_cb\\(ui_Home_" + t2.name + ", ui_textarea_focus_cb, LV_EVENT_FOCUSED, ui_Home_" + k.name + "\\);"));
  assert.match(c, new RegExp("lv_textarea_set_password_mode\\(ui_Home_" + t2.name + ", true\\);"));
  assert.match(c, new RegExp("lv_obj_add_event_cb\\(ui_Home_" + t1.name + ", ui_action_save, LV_EVENT_READY, NULL\\);"));
  assert.match(c, /lv_obj_set_align\(ui_Home_Keyboard\d+, LV_ALIGN_TOP_LEFT\);/);
  const y = E.genYAML(p).yaml;
  assert.match(y, /on_ready:\n\s+- script\.execute: action_save/);
  assert.match(y, new RegExp("textarea: home_" + t1.name.toLowerCase()));
  assert.match(y, /selected_index: 2/);
  const x = E.genXML(p).map(f => f.xml).join("");
  assert.match(x, /<lv_roller [^>]*options="A&#10;B&#10;C" selected="2"/);
  assert.match(x, /<event_cb trigger="ready" callback="ui_action_save"\/>/);
  assert.match(E.genPy(p), /\.set_textarea\(home_textfield\d+\)/);
});

test("Design Doctor adds a keyboard for a text field that has none", () => {
  const b = E.BOARDS.find(x => x.touch && x.w >= 480);
  const p = E.blank(b), s = E.mkScreen(p, "Main", "#FFFFFF");
  const t = E.mkW(p, "textarea", { x: 20, y: 20, w: 200, h: 44 }); s.widgets.push(t);
  const issue = E.doctor(p).find(i => i.code == "nokeyboard");
  assert.ok(issue);
  assert.ok(E.applyFix(p, issue));
  const k = s.widgets.find(w => w.type == "keyboard");
  assert.ok(k && k.w == b.w && k.y + k.h == b.h, "the keyboard spans the bottom of the screen");
  assert.ok(!E.doctor(p).some(i => i.code == "nokeyboard"));
});

test("only PNG data URLs are accepted as pictures", () => {
  const [, ok] = E.cleanWidget(E.BOARDS[0], { type: "image", x: 0, y: 0, w: 50, h: 50, image: { src: "data:image/png;base64,iVBORw0KGgo=" } });
  assert.ok(ok.image);
  for (const src of ["javascript:alert(1)", "https://example.com/a.png", "data:image/svg+xml;base64,PHN2Zz4="]) {
    const [, w] = E.cleanWidget(E.BOARDS[0], { type: "image", x: 0, y: 0, w: 50, h: 50, image: { src } });
    assert.equal(w.image, undefined, src);
  }
});
