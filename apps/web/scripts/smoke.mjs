const base = process.argv[2] ?? "http://localhost:8787";
const pages = ["/", "/community", "/makers", "/boards", "/templates", "/docs", "/docs/getting-started", "/pricing", "/privacy", "/terms", "/login", "/editor/", "/editor/epixo-lvgl.wasm", "/manifest.webmanifest"];

async function waitForServer() {
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(base + "/")).status < 500) return;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${base} did not start`);
}

await waitForServer();
let failed = 0;
for (const p of pages) {
  const r = await fetch(base + p, { redirect: "manual" });
  const ok = r.status === 200;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${r.status} ${p}`);
}

const login = await fetch(base + "/api/auth/dev?next=/dashboard", { redirect: "manual" });
const cookie = login.headers.get("set-cookie")?.split(";")[0];
const me = cookie ? await fetch(base + "/api/projects", { headers: { cookie } }) : null;
const signedIn = login.status === 307 && me?.status === 200;
if (!signedIn) failed++;
console.log(`${signedIn ? "ok  " : "FAIL"} test sign-in and account API`);

const blocked = await fetch(base + "/api/waitlist", { method: "POST", headers: { origin: "https://evil.example", "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify({ email: "smoke@example.com" }) });
if (blocked.status !== 403) failed++;
console.log(`${blocked.status === 403 ? "ok  " : "FAIL"} cross-site request is blocked`);

if (failed) {
  console.error(`${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log("All smoke checks passed");
