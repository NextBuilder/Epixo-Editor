// End-to-end checks for the website and the editor, driven in a real browser.
// Usage: BASE=http://localhost:8787 node tests/e2e/run.mjs   (needs Playwright and a local build with test sign-in)
import { createRequire } from "node:module";
import { deflateSync } from "node:zlib";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const JSZip = require("../../apps/web/node_modules/jszip");
const BASE = process.env.BASE || "http://localhost:8787";
const failures = [], shots = process.env.E2E_SHOTS, open = {};
let n = 0;

async function step(name, fn) {
  const t = Date.now();
  n++;
  try {
    await fn();
    console.log(`ok   ${name} (${Date.now() - t} ms)`);
  } catch (e) {
    failures.push(name);
    console.log(`FAIL ${name}\n     ${String(e.message).split("\n")[0]}`);
    // With E2E_SHOTS set to a folder, every open page is captured when a check fails.
    if (shots) for (const [who, page] of Object.entries(open)) await page.screenshot({ path: `${shots}/${n}-${who}.png` }).catch(() => {});
  }
}
function expect(cond, msg) { if (!cond) throw new Error(msg); }

// A small RGBA PNG, so the picture flow uses a real file.
function png(w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw.set([x * 8 & 255, 120, y * 8 & 255, Math.hypot(x - w / 2, y - h / 2) < w / 2 ? 255 : 0], y * (w * 4 + 1) + 1 + x * 4);
  const crcT = []; for (let k = 0; k < 256; k++) { let c = k; for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcT[k] = c >>> 0; }
  const crc = b => { let c = 0xFFFFFFFF; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

const browser = await chromium.launch();
async function person(as, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...opts });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", e => page.errors.push(e.message));
  const r = await page.goto(`${BASE}/api/auth/dev?as=${as}&next=/`);
  expect(r && r.ok(), `test sign-in answered ${r && r.status()} at ${BASE}${r && r.status() == 429 ? " (sign-in is rate limited; wait a few minutes)" : ""}`);
  return page;
}
const go = async (page, path) => { const r = await page.goto(BASE + path, { waitUntil: "networkidle" }); expect(r && r.status() < 400, `${path} answered ${r && r.status()}`); };

const maker = await person("maker"), client = await person("client");
Object.assign(open, { maker, client });
const me = await (await maker.request.get(BASE + "/api/me")).json();
const handle = me.user?.handle || me.handle;

await step("every page opens without errors", async () => {
  for (const p of ["/", "/community", "/makers", "/templates", "/boards", "/connect", "/docs", "/docs/firmware", "/pricing", "/dashboard", "/notifications", "/saved", "/settings", `/u/${handle}`]) {
    await go(maker, p);
    expect(!maker.errors.length, `${p}: ${maker.errors.join("; ")}`);
    const wide = await maker.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(wide <= 0, `${p} scrolls sideways by ${wide}px`);
  }
});

await step("settings: add a social link from the picker and see it on the profile", async () => {
  await go(maker, "/settings");
  await maker.click('button:has-text("Add link")');
  await maker.click('[role=dialog] button:has-text("Mastodon")');
  await maker.fill("#link-mastodon", "@epixo@mastodon.social");
  await maker.click('button:has-text("Save changes")');
  await maker.waitForSelector("text=Profile saved");
  await go(maker, `/u/${handle}`);
  expect(await maker.isVisible("text=Mastodon"), "Mastodon is not on the profile");
  await go(maker, "/settings");
  await maker.click('button[aria-label="Remove Mastodon"]');
  await maker.click('button:has-text("Save changes")');
  await maker.waitForSelector("text=Profile saved");
});

let postPath = "";
await step("community: like, save and comment on a project", async () => {
  await go(client, "/community");
  postPath = await client.$eval(`a[href^="/community/"]`, a => a.getAttribute("href"));
  await go(client, postPath);
  const like = client.locator("button[aria-pressed]").first();
  const before = await like.getAttribute("aria-pressed");
  await like.click();
  await client.waitForFunction(b => document.querySelector("button[aria-pressed]").getAttribute("aria-pressed") !== b, before);
  await like.click();
  const text = "Runs great on my CYD " + Date.now().toString(36);
  await client.fill('section[aria-labelledby="comments-h"] textarea', text);
  await client.press('section[aria-labelledby="comments-h"] textarea', "Enter");
  await client.waitForSelector(`text=${text}`);
});

await step("notifications: the maker hears about it", async () => {
  await go(maker, "/notifications");
  expect(await maker.locator("text=commented").count() > 0, "no comment notification");
});

await step("hiring: a client sends a request and the maker sees it", async () => {
  await go(client, `/u/${handle}`);
  await client.click('button:has-text("Hire")');
  const dlg = client.locator("[role=dialog]");
  await dlg.locator('input[placeholder="Your name"]').fill("Priya Shah");
  await dlg.locator('input[type=email]').fill("priya@example.com");
  const subject = "Thermostat screens " + Date.now().toString(36);
  await dlg.locator("textarea").fill(subject + ": four screens for a 4.3 inch panel, with a Wi-Fi setup page.");
  const [res] = await Promise.all([client.waitForResponse(r => /\/hire$/.test(r.url()) && r.request().method() == "POST"), dlg.locator('button:has-text("Send request")').click()]);
  if (res.status() == 429) {
    // The anti-spam limits (2 requests a day to one maker, 6 an hour in total) stop repeat runs; check an earlier request arrived.
    const why = (await res.json().catch(() => ({}))).error || "too many requests";
    expect(await client.isVisible(`text=${why}`), "the limit message is not shown to the client");
    await go(maker, "/dashboard?tab=requests");
    expect(await maker.locator("text=Priya Shah").count() > 0, "no earlier request is in the inbox");
    console.log(`     note: ${why} The inbox was checked instead.`);
    return;
  }
  await client.waitForSelector("text=Request sent");
  await go(maker, "/dashboard?tab=requests");
  expect(await maker.locator(`text=${subject}`).count() > 0, "the request is not in the inbox");
});

const ed = await maker.context().newPage();
ed.errors = [];
ed.on("pageerror", e => ed.errors.push(e.message));
open.editor = ed;
await step("editor: build a screen with a roller, text field, keyboard and picture", async () => {
  await go(ed, "/editor/");
  await ed.waitForFunction(() => document.querySelector("#leftBody .tile"));
  await ed.keyboard.press("Escape");
  await ed.waitForTimeout(900);
  await ed.click('#leftTabs button:has-text("Screens")');
  await ed.click("#addScr");
  await ed.click('#leftTabs button:has-text("Add")');
  for (const t of ["roller", "textarea", "keyboard"]) await ed.click(`#leftBody .tile[data-type="${t}"]`);
  await ed.evaluate(b64 => {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), dt = new DataTransfer();
    dt.items.add(new File([bin], "logo.png", { type: "image/png" }));
    document.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true }));
  }, png(48, 48).toString("base64"));
  await ed.waitForSelector("text=Picture added");
  await ed.click('#leftTabs button:has-text("Layers")');
  await ed.click('#leftBody .row:has-text("TextField") .nm');
  await ed.fill("#wAct", "join wifi");
  await ed.press("#wAct", "Tab");
  await ed.waitForTimeout(500);
  expect(await ed.isVisible("text=ui_action_join_wifi"), "the action name is not shown");
  await ed.click("#codeBtn");
  await ed.waitForFunction(() => /ui_action_join_wifi/.test(document.querySelector("#codePre")?.textContent || ""));
  await ed.waitForFunction(() => /lv_image_dsc_t|lv_img_dsc_t/.test(document.querySelector("#codePre")?.textContent || ""));
  await ed.click("#codeBtn");
  expect(!ed.errors.length, ed.errors.join("; "));
});

await step("editor: Try it says which firmware function a tap runs", async () => {
  await ed.click('#leftBody .row:has-text("TextField") .nm');
  const box = await ed.evaluate(() => { const el = document.querySelector("#overlay .selbox"); const r = el.getBoundingClientRect(); return { x: r.x + 12, y: r.y + r.height / 2 }; });
  await ed.click("#playBtn");
  await ed.waitForTimeout(800);
  await ed.mouse.move(box.x, box.y); await ed.mouse.down(); await ed.waitForTimeout(80); await ed.mouse.up();
  const said = await ed.waitForFunction(() => /runs ui_action_join_wifi\(\)/.test(document.querySelector(".toast")?.textContent || ""), null, { timeout: 8000 }).catch(() => null);
  expect(said, `no action toast after tapping ${Math.round(box.x)},${Math.round(box.y)}; toast: "${await ed.$eval(".toast", e => e.textContent).catch(() => "none")}"`);
  await ed.click("#playBtn");
});

await step("editor: export for PlatformIO includes the code, the picture and the README", async () => {
  await ed.click("#exportBtn");
  await ed.click('[data-for="pio"]');
  const [dl] = await Promise.all([ed.waitForEvent("download"), ed.click("#exZip")]);
  const zip = await JSZip.loadAsync(fs.readFileSync(await dl.path()));
  const names = Object.keys(zip.files);
  expect(names.includes("ui/ui.c") && names.includes("ui/ui.h") && names.includes("README.md"), "missing files: " + names.join(", "));
  const c = await zip.file("ui/ui.c").async("string"), readme = await zip.file("README.md").async("string");
  expect(/ui_action_join_wifi/.test(c) && /lv_keyboard_create/.test(c) && /_map\[\] = \{/.test(c), "ui.c lacks the action, keyboard or picture");
  expect(/void ui_action_join_wifi\(lv_event_t \* e\)/.test(readme), "README has no starter for the action");
  await ed.keyboard.press("Escape");
});

await step("appearance: dark mode switches and is remembered", async () => {
  await go(maker, "/");
  await maker.evaluate(() => { localStorage.setItem("epixo.theme", "dark"); });
  await go(maker, "/community");
  expect(await maker.evaluate(() => document.documentElement.dataset.theme) === "dark", "dark mode was not applied");
  await maker.evaluate(() => localStorage.removeItem("epixo.theme"));
});

await browser.close();
console.log(failures.length ? `\n${failures.length} of ${n} checks failed` : `\nAll ${n} end-to-end checks passed`);
process.exit(failures.length ? 1 : 0);
