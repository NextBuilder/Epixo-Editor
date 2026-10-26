(() => {
'use strict';
if (window.epixoHost) return;

const LOCAL = 'epixo.local.projects';
const meP = fetch('/api/me', {cache: 'no-store', credentials: 'same-origin'}).then(r => r.ok ? r.json() : null).catch(() => null);
window.EPX_HOSTED = {me: meP};

const fail = (status, msg) => Object.assign(new Error(msg || 'Request failed'), {code: status == 401 ? 'signed_out' : status == 402 ? 'no_credits' : status == 503 ? 'ai_off' : status == 429 ? 'rate_limited' : status == 413 ? 'too_big' : 'failed', status});
async function api(url, init) {
  let r;
  try { r = await fetch(url, Object.assign({credentials: 'same-origin'}, init)); }
  catch (e) { if (e && e.name == 'AbortError') throw {code: 'cancelled'}; throw fail(0, 'Network error'); }
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw fail(r.status, j.error); }
  return r;
}

// Last version of each project this editor saved or loaded, so changes from a connected AI can be told apart.
const seen = {};

/* ---- local project store for signed-out makers ---- */
const readLocal = () => { try { return JSON.parse(localStorage.getItem(LOCAL) || '{}'); } catch (e) { return {}; } };
const writeLocal = o => {
  const ids = Object.keys(o).sort((a, b) => (o[b].updated || 0) - (o[a].updated || 0));
  for (const id of ids.slice(30)) delete o[id];
  try { localStorage.setItem(LOCAL, JSON.stringify(o)); } catch (e) { throw {code: 'too_big'}; }
};

function dbFor(signedIn) {
  const doc = pid => signedIn ? {
    set: async d => { const j = await (await api('/api/projects/' + pid, {method: 'PUT', headers: {'content-type': 'application/json'}, body: d.json})).json(); seen[pid] = j.updated_at; },
    get: async () => { const t = await (await api('/api/projects/' + pid)).text(); return {exists: true, data: () => ({json: t})}; },
    delete: () => api('/api/projects/' + pid, {method: 'DELETE'})
  } : {
    set: async d => { const o = readLocal(); o[pid] = d; writeLocal(o); },
    get: async () => { const d = readLocal()[pid]; if (!d) throw {code: 'missing'}; return {exists: true, data: () => d}; },
    delete: async () => { const o = readLocal(); delete o[pid]; writeLocal(o); }
  };
  const list = async () => {
    if (!signedIn) { const o = readLocal(); return Object.keys(o).map(id => { const d = o[id]; return {id, data: () => d}; }).sort((a, b) => (b.data().updated || 0) - (a.data().updated || 0)); }
    const j = await (await api('/api/projects', {cache: 'no-store'})).json();
    return j.projects.map(p => ({id: p.id, data: () => ({kind: 'epixo-project', name: p.name, board: p.board_label, w: p.w, h: p.h, screens: p.screens, updated: p.updated_at * 1000, published: p.post_id})}));
  };
  return {collection: () => { const q = {doc, orderBy: () => q, limit: () => q, get: async () => ({docs: await list()})}; return q; }};
}

/* ---- AI through /api/ai ---- */
async function toImageBlock(file) {
  let blob = file;
  try {
    const bmp = await createImageBitmap(file), k = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.9));
  } catch (e) { throw {code: 'image_rejected'}; }
  const b = new Uint8Array(await blob.arrayBuffer()); let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return {type: 'image', source: {type: 'base64', media_type: 'image/jpeg', data: btoa(s)}};
}
async function ask(body, signal) {
  const j = await (await api('/api/ai', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body), signal})).json();
  window.EPX_HOSTED.credits = j.credits;
  return j;
}
const textOf = content => (content || []).filter(c => c.type == 'text').map(c => c.text).join('');
function normalize(turns) {
  const out = [];
  for (const t of turns) {
    const last = out[out.length - 1];
    if (last && last.role == t.role && typeof last.content == 'string' && typeof t.content == 'string') last.content += '\n\n' + t.content;
    else out.push({role: t.role, content: t.content});
  }
  if (out[0] && out[0].role != 'user') out.unshift({role: 'user', content: 'Hello'});
  return out;
}
async function sample(turns, opts) {
  opts = opts || {};
  const tools = opts.tools || [], messages = normalize(turns), schema = tools.map(t => ({name: t.name, description: t.description, input_schema: t.inputSchema || {type: 'object', properties: {}}}));
  let text = '';
  for (let step = 0; step < 10; step++) {
    const r = await ask({messages, tools: schema.length ? schema : undefined, max_tokens: 4096}, opts.signal);
    const t = textOf(r.content); if (t) { text += (text ? '\n\n' : '') + t; opts.onText && opts.onText({text}); }
    const uses = (r.content || []).filter(c => c.type == 'tool_use');
    if (r.stop_reason != 'tool_use' || !uses.length) break;
    messages.push({role: 'assistant', content: r.content});
    const results = [];
    for (const u of uses) {
      const tool = tools.find(x => x.name == u.name);
      try { const out = tool ? await tool.execute(u.input || {}) : {error: 'unknown tool'}; results.push({type: 'tool_result', tool_use_id: u.id, content: JSON.stringify(out == null ? {ok: true} : out)}); }
      catch (e) { results.push({type: 'tool_result', tool_use_id: u.id, content: String(e && e.message || e), is_error: true}); }
    }
    messages.push({role: 'user', content: results});
  }
  return {text};
}
sample.json = async (prompt, opts) => {
  opts = opts || {};
  const content = opts.images ? [...await Promise.all([].concat(opts.images).map(toImageBlock)), {type: 'text', text: prompt}] : prompt;
  const r = await ask({system: 'Reply with one JSON object and nothing else.', messages: [{role: 'user', content}], max_tokens: 8000}, opts.signal);
  const t = textOf(r.content), a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) throw {code: 'invalid_json'};
  try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { throw {code: 'invalid_json'}; }
};

/* ---- downloads ---- */
const downloads = {save: async ({filename, data}) => {
  const blob = data instanceof Blob ? data : new Blob([data]), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}};

window.epixoHost = {use: async name => {
  const me = await meP, signedIn = !!(me && me.user);
  if (name == 'downloads') return downloads;
  if (name == 'db') return dbFor(signedIn);
  if (name == 'user') return {id: async () => signedIn ? me.user.id : 'local'};
  if (name == 'sample') return sample;
  return null;
}};

/* ---- page chrome: account, publish, URL actions ---- */
const qs = new URLSearchParams(location.search);
document.addEventListener('DOMContentLoaded', async () => {
  const A = window.EpixoApp; if (!A) return;
  const E = A.E, me = await meP, user = me && me.user;
  const top = document.querySelector('header.top');
  const brand = top.querySelector('.brand'); brand.style.cursor = 'pointer'; brand.title = 'Epixo home'; brand.onclick = () => { location.href = '/'; };

  const exp = document.getElementById('exportBtn');
  const pub = document.createElement('button');
  pub.className = 'tbtn'; pub.id = 'pubBtn'; pub.title = 'Publish to the community';
  pub.innerHTML = '<svg class="i" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM143.31,41.34,152,56.9,125.09,81.24,112.85,88H96.14a16,16,0,0,0-13.88,8l-8.73,15.23L63.38,84.19,74.32,58.32a87.87,87.87,0,0,1,69-17ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Zm102.58,86.78,1.13-5.81a16.09,16.09,0,0,0-4-13.9,1.85,1.85,0,0,1-.14-.14L120,174.74,133.7,144l22.82,3.08,45.72,28.12A88.18,88.18,0,0,1,142.58,214.78Z"/></svg><span class="lbl-l">Publish</span>';
  exp.before(pub);
  const acct = document.createElement('a');
  acct.className = 'tbtn'; acct.style.padding = '0 4px'; acct.style.textDecoration = 'none';
  if (user) {
    acct.href = '/dashboard'; acct.title = 'Your dashboard';
    acct.innerHTML = user.avatar ? `<img src="${A.esc(user.avatar)}" alt="" referrerpolicy="no-referrer" style="width:26px;height:26px;border-radius:50%;object-fit:cover">` : `<span style="width:26px;height:26px;border-radius:50%;background:#0A6CFF;color:#fff;display:grid;place-items:center;font-weight:600;font-size:12px">${A.esc(user.name.slice(0, 1).toUpperCase())}</span>`;
  } else {
    acct.href = '/login?next=' + encodeURIComponent('/editor'); acct.textContent = 'Sign in'; acct.style.padding = '0 10px'; acct.style.color = 'var(--accent)'; acct.style.fontWeight = '600';
  }
  exp.after(acct);
  pub.onclick = () => {
    if (user) return openPublish(A);
    A.toast('Sign in to publish. Your project stays saved in this browser.');
    setTimeout(() => { location.href = '/login?next=' + encodeURIComponent('/editor'); }, 1200);
  };

  if (user) {
    const local = readLocal(), ids = Object.keys(local);
    if (ids.length) {
      let n = 0;
      for (const id of ids) { try { await api('/api/projects/' + id, {method: 'PUT', headers: {'content-type': 'application/json'}, body: local[id].json}); delete local[id]; n++; } catch (e) {} }
      writeLocal(local);
      if (n) A.toast(n == 1 ? 'Your project from this browser is now in your account.' : n + ' projects from this browser are now in your account.');
    }
  }

  if (user) followAI(A);

  const clean = () => history.replaceState(null, '', '/editor/');
  try {
    if (qs.get('open')) {
      if (!user) { location.href = '/login?next=' + encodeURIComponent('/editor?open=' + qs.get('open')); return; }
      const p = JSON.parse(await (await api('/api/projects/' + encodeURIComponent(qs.get('open')))).text());
      p.pid = qs.get('open'); await A.open(p, 'Opened ' + (p.name || 'project'));
    } else if (qs.get('remix')) {
      const id = qs.get('remix'), p = JSON.parse(await (await api('/api/posts/' + encodeURIComponent(id) + '/project')).text());
      p.pid = A.newPid(); p.remixOf = id;
      await A.open(p, 'Opened a copy of ' + (p.name || 'the project') + '. Publish it and the original gets credit.');
    } else if (qs.get('template') || qs.get('board') || qs.get('new')) {
      const cur = A.project(), fresh = qs.get('board') && E.BOARDS.find(b => b.id == qs.get('board'));
      const board = fresh ? E.withRotation(fresh, 0) : cur.board, key = qs.get('template');
      const p = E.blank(board); p.pid = A.newPid();
      if (key && E.TPL[key]) { p.name = E.TPL[key].n; const ss = E.addTemplate(p, key, board.w, board.h, board.round); p.cur = ss[0].id; }
      else { p.name = 'Untitled UI'; const s = E.mkScreen(p, 'Home'); p.cur = s.id; }
      await A.open(p, key && E.TPL[key] ? E.TPL[key].n + ' on ' + board.brand + ' ' + board.name : 'New project on ' + board.brand + ' ' + board.name);
    } else return;
  } catch (e) {
    A.toast(e && e.code == 'signed_out' ? 'Sign in to open that project.' : 'That project could not be opened.');
  }
  clean();
});

// While a project is open, check every few seconds whether Claude or ChatGPT changed it through an AI connection.
function followAI(A) {
  let busy = false;
  const tick = async () => {
    if (busy || document.hidden) return;
    const pid = A.project().pid;
    busy = true;
    try {
      const r = await fetch('/api/projects/' + pid + '/rev', {credentials: 'same-origin', cache: 'no-store'});
      if (!r.ok) return;
      const v = await r.json();
      if (seen[pid] == null) { seen[pid] = v.updated_at; return; }
      if (v.updated_at <= seen[pid] || !v.updated_by) return;
      seen[pid] = v.updated_at;
      const p = JSON.parse(await (await api('/api/projects/' + pid, {cache: 'no-store'})).text());
      p.pid = pid;
      A.applyRemote(p, {text: v.updated_by + ': ' + (v.update_note || 'Updated the design'), switchScreen: /^Designed|^Added a template/.test(v.update_note)});
    } catch (e) {} finally { busy = false; }
  };
  setInterval(tick, 3000);
  document.addEventListener('visibilitychange', tick);
}

function openPublish(A) {
  const P = A.project(), esc = A.esc;
  const m = A.modal(`<div class="sheet md"><div class="sheet-h"><div style="flex:1;min-width:0"><h2>Publish to the community</h2><p>Anyone can see it, open it in Epixo and publish their own version with credit to you.</p></div>${A.xBtn}</div>
    <form id="pubForm" style="padding:14px 18px 18px;display:grid;gap:12px">
      <div id="pubShots" style="display:flex;gap:8px;overflow-x:auto;min-height:72px;align-items:center"><span class="note" style="margin:0">Rendering screens…</span></div>
      <label style="display:grid;gap:6px;font-weight:600;font-size:13px">Title<input class="fld" name="title" required minlength="3" maxlength="80" value="${esc(P.name)}"></label>
      <label style="display:grid;gap:6px;font-weight:600;font-size:13px">What is it for? <span style="font-weight:400;color:var(--ink3)">Optional. Wiring notes and sensors help others.</span><textarea class="fld" name="description" maxlength="2000" rows="4" style="height:auto;padding:8px 10px;resize:vertical"></textarea></label>
      <label style="display:grid;gap:6px;font-weight:600;font-size:13px">Tags <span style="font-weight:400;color:var(--ink3)">Up to 6, separated by commas</span><input class="fld" name="tags" maxlength="120" placeholder="smart-home, esp32, weather"></label>
      <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end"><span class="status" id="pubSt" style="flex:1;margin:0"></span><button class="primary" id="pubGo" disabled>Publish</button></div>
    </form></div>`);
  const shots = m.el.querySelector('#pubShots'), st = m.el.querySelector('#pubSt'), go = m.el.querySelector('#pubGo'), blobs = [];
  (async () => {
    for (const s of P.screens.slice(0, 12)) { const b = await A.png(s); if (b) blobs.push(b); }
    if (!blobs.length) { shots.innerHTML = '<span class="note" style="margin:0">The LVGL engine is not running, so screens cannot be rendered here.</span>'; return; }
    shots.innerHTML = '';
    for (const b of blobs) { const img = document.createElement('img'); img.src = URL.createObjectURL(b); img.alt = ''; img.style.cssText = 'height:72px;border-radius:' + (P.board.round ? '50%' : '6px') + ';background:#111;flex:none'; shots.appendChild(img); }
    go.disabled = false;
  })();
  m.el.querySelector('#pubForm').onsubmit = async e => {
    e.preventDefault(); go.disabled = true; st.textContent = 'Saving your project';
    try {
      await api('/api/projects/' + P.pid, {method: 'PUT', headers: {'content-type': 'application/json'}, body: JSON.stringify(P)});
      st.textContent = 'Publishing';
      const f = new FormData(e.target), fd = new FormData();
      ['title', 'description', 'tags'].forEach(k => fd.append(k, f.get(k) || ''));
      blobs.forEach((b, i) => fd.append('images', b, 'screen-' + (i + 1) + '.png'));
      const j = await (await api('/api/projects/' + P.pid + '/publish', {method: 'POST', body: fd})).json();
      st.innerHTML = 'Published. <a href="' + esc(j.url) + '" target="_blank" style="color:var(--accent);font-weight:600">View it in the community</a>';
      go.textContent = 'Update post'; go.disabled = false;
    } catch (er) {
      st.textContent = er && er.message ? er.message : 'Could not publish. Try again.'; go.disabled = false;
    }
  };
}
})();
