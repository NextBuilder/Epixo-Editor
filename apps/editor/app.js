(() => {
'use strict';
const E = window.EpixoCore;
const $ = s => document.querySelector(s);
const h = s => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R = Math.round, clamp = E.clamp;
// Icons are Phosphor (MIT), drawn on a 256 grid.
const ico = (p, c) => `<svg class="${c || 'i'}" viewBox="0 0 256 256">${p}</svg>`;
const I = {
  plus:'<path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>',
  close:'<path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/>',
  search:'<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>',
  dup:'<path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/>',
  trash:'<path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>',
  up:'<path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z"/>',
  down:'<path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"/>',
  lock:'<path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"/>',
  unlock:'<path d="M208,80H96V56a32,32,0,0,1,32-32c15.37,0,29.2,11,32.16,25.59a8,8,0,0,0,15.68-3.18C171.32,24.15,151.2,8,128,8A48.05,48.05,0,0,0,80,56V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,128H48V96H208V208Z"/>',
  eye:'<path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>',
  eyeoff:'<path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z"/>',
  chip:'<path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Zm88,0H216V112h16a8,8,0,0,0,0-16H216V56a16,16,0,0,0-16-16H160V24a8,8,0,0,0-16,0V40H112V24a8,8,0,0,0-16,0V40H56A16,16,0,0,0,40,56V96H24a8,8,0,0,0,0,16H40v32H24a8,8,0,0,0,0,16H40v40a16,16,0,0,0,16,16H96v16a8,8,0,0,0,16,0V216h32v16a8,8,0,0,0,16,0V216h40a16,16,0,0,0,16-16V160h16a8,8,0,0,0,0-16Zm-32,56H56V56H200v95.87s0,.09,0,.13,0,.09,0,.13V200Z"/>',
  chev:'<path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/>',
  spark:'<path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z"/>',
  screen:'<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM80,84A12,12,0,1,1,68,72,12,12,0,0,1,80,84Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,120,84Z"/>',
  bolt:'<path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z"/>',
  usb:'<path d="M252.44,121.34l-48-32A8,8,0,0,0,192,96v24H72V72h33a32,32,0,1,0,0-16H72A16,16,0,0,0,56,72v48H8a8,8,0,0,0,0,16H56v48a16,16,0,0,0,16,16h32v8a16,16,0,0,0,16,16h32a16,16,0,0,0,16-16V176a16,16,0,0,0-16-16H120a16,16,0,0,0-16,16v8H72V136H192v24a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM136,48a16,16,0,1,1-16,16A16,16,0,0,1,136,48ZM120,176h32v32H120Zm88-30.95V111l25.58,17Z"/>',
  dl:'<path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/>',
  cloud:'<path d="M160,40A88.09,88.09,0,0,0,81.29,88.67,64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Z"/>',
  check:'<path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/>',
  wand:'<path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"/>',
  img:'<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z"/>',
  chat:'<path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"/>',
  send:'<path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"/>',
  play:'<path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>',
  stop:'<path d="M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z"/>'
};
const FONT_KB = {12:13,14:16,16:19,18:23,20:27,22:31,24:36,26:41,28:46,30:52,32:58,34:65,36:72,38:78,40:86,42:93,44:101,46:108,48:117};

const S = {p: null, sel: null, hover: null, zoom: 1, mode: 'design', hist: [], fut: [], clip: null, code: false, ctab: 'c', lv: 9, left: 'widgets', right: 'design', q: '', mob: null, lastFit: true};
const LKEY = 'epixo.project.v2';
const cur = () => S.p.screens.find(s => s.id == S.p.cur) || S.p.screens[0];
const selW = () => S.sel ? cur().widgets.find(w => w.id == S.sel) : null;
const BW = () => S.p.board.w, BH = () => S.p.board.h;

/* ---------------- capabilities ---------------- */
const use = n => (window.epixoHost && window.epixoHost.use) ? window.epixoHost.use(n).catch(() => null) : Promise.resolve(null);
const CAP = {sample: null, downloads: null, db: null, user: null, uid: null};
const capsReady = Promise.all([use('sample'), use('downloads'), use('db'), use('user')]).then(async ([sa, dl, db, us]) => {
  CAP.sample = sa; CAP.downloads = dl; CAP.db = db; CAP.user = us;
  if (us && db) { try { CAP.uid = await us.id(); } catch (e) { CAP.uid = null; } }
  renderSaveState();
  if (S.right == 'device') renderRight();
});

/* ---------------- persistence ---------------- */
function newPid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function migrate(p) {
  if (!p || !p.board || !Array.isArray(p.screens) || !p.screens.length) return null;
  p.counts = p.counts || {}; p.pid = p.pid || newPid(); p.lvgl = p.lvgl || 9;
  const fresh = E.BOARDS.find(b => b.id == p.board.id);
  if (fresh) p.board = Object.assign(E.withRotation(fresh, p.board.rot || 0));
  p.screens.forEach(s => s.widgets.forEach(w => {
    if (w.type == 'label' && !w.valign) w.valign = 'center';
    if (w.font && !E.LH[w.font]) w.font = E.F(w.font);
  }));
  return p;
}
function load() {
  try { const raw = localStorage.getItem(LKEY) || localStorage.getItem('epixo.project.v1'); if (raw) { const p = migrate(JSON.parse(raw)); if (p) return p; } } catch (e) {}
  const p = E.defaultProject(); p.pid = newPid(); return p;
}
let saveT, cloudT, cloudBusy = false, cloudOk = null, cloudDirty = false;
function save() {
  S.p.updated = Date.now();
  clearTimeout(saveT);
  saveT = setTimeout(() => { try { localStorage.setItem(LKEY, JSON.stringify(S.p)); } catch (e) {} }, 200);
  cloudDirty = true; clearTimeout(cloudT); cloudT = setTimeout(cloudSave, 1500);
  renderSaveState();
  watchers.forEach(fn => fn(S.p));
}
const watchers = [];
function projectRef(pid) { return CAP.db.collection('data/users/' + CAP.uid).doc(pid); }
async function cloudSave() {
  if (!CAP.db || !CAP.uid || cloudBusy) return;
  cloudBusy = true; cloudDirty = false; renderSaveState();
  const P = S.p, json = JSON.stringify(P);
  try {
    if (json.length > 240000) throw {code: 'too_big'};
    await projectRef(P.pid).set({kind: 'epixo-project', name: P.name, board: P.board.brand + ' ' + P.board.name, w: P.board.w, h: P.board.h, screens: P.screens.length, updated: P.updated || Date.now(), json});
    cloudOk = true;
  } catch (e) { cloudOk = e && e.code == 'too_big' ? 'big' : false; }
  cloudBusy = false; renderSaveState();
  if (cloudDirty) { clearTimeout(cloudT); cloudT = setTimeout(cloudSave, 800); }
}
function renderSaveState() {
  const el = $('#saveState'); if (!el) return;
  const cloud = CAP.db && CAP.uid;
  el.className = 'save' + (cloud && cloudOk === true && !cloudBusy && !cloudDirty ? ' cloud' : '') + (cloudBusy || (cloud && cloudDirty) ? ' busy' : '');
  if (CAP.uid == 'local') { el.className = 'save'; el.querySelector('span').textContent = 'Saved in this browser'; return; }
  el.querySelector('span').textContent = !cloud ? 'Saved in this browser' : cloudBusy || cloudDirty ? 'Saving…' : cloudOk === true ? 'Saved to your account' : cloudOk === 'big' ? 'Too big for cloud · saved here' : cloudOk === false ? 'Cloud save failed · saved here' : 'Saved in this browser';
}

/* ---------------- history ---------------- */
const snap = () => JSON.stringify(S.p);
function push() { S.hist.push(snap()); if (S.hist.length > 150) S.hist.shift(); S.fut = []; }
function fixSel() { if (!S.p.screens.some(s => s.id == S.p.cur)) S.p.cur = S.p.screens[0].id; if (S.sel && !selW()) S.sel = null; }
function undo() { if (!S.hist.length) return; S.fut.push(snap()); const b = S.p.board; S.p = JSON.parse(S.hist.pop()); fixSel(); boardChanged(b); save(); renderAll(); }
function redo() { if (!S.fut.length) return; S.hist.push(snap()); const b = S.p.board; S.p = JSON.parse(S.fut.pop()); fixSel(); boardChanged(b); save(); renderAll(); }
function mutate(fn) { const b = S.p.board; push(); fn(); boardChanged(b); save(); renderAll(); }
function boardChanged(prev) { const b = S.p.board; if (ENG && (prev.w != b.w || prev.h != b.h)) { ENG.init(b.w, b.h); sizeCanvas(); } }

/* ---------------- engine ---------------- */
let ENG = null, TH = null, engineState = 'loading', engineErr = '';
const canvas = $('#lvcanvas'), ctx = canvas.getContext('2d');
function sizeCanvas() { canvas.width = BW(); canvas.height = BH(); if (ENG && ENG.img) ENG.img = null; }
async function startEngine() {
  try {
    ENG = await EpixoEngine.create('epixo-lvgl.wasm', BW(), BH());
    sizeCanvas(); engineState = 'on';
    canvas.hidden = false; $('#screen').classList.add('engine');
    syncAll(); renderEngChip(); renderLeft(); renderRight();
    requestAnimationFrame(frame);
  } catch (e) {
    engineState = 'off'; engineErr = String(e && e.message || e);
    renderEngChip(); renderCanvas();
  }
}
async function thumbEngine() {
  if (TH) return TH;
  if (engineState != 'on') return null;
  TH = await EpixoEngine.create('epixo-lvgl.wasm', BW(), BH()).catch(() => null);
  return TH;
}
function renderEngChip() {
  const c = $('#engChip');
  c.className = 'engchip ' + (engineState == 'on' ? 'on' : engineState == 'off' ? 'off' : '');
  c.querySelector('span').textContent = engineState == 'on' ? 'LVGL 9.2 engine' : engineState == 'off' ? 'Quick preview' : 'Loading LVGL…';
  c.title = engineState == 'on' ? 'Real LVGL 9.2 compiled to WebAssembly. What you see is what the device draws.' : engineState == 'off' ? 'The LVGL engine could not start here (' + engineErr + '). Showing an approximate HTML preview.' : '';
}
function syncScreen(s) {
  if (!ENG) return;
  const sc = E.scriptScreen(S.p, s);
  if (ENG.synced.get(s.id) !== sc) { ENG.exec(sc); ENG.synced.set(s.id, sc); }
}
function syncAll() {
  if (!ENG) return;
  const ids = new Set(S.p.screens.map(s => s.id));
  for (const id of [...ENG.synced.keys()]) if (!ids.has(id)) { ENG.exec('K\t' + E.sid(id)); ENG.synced.delete(id); }
  S.p.screens.forEach(syncScreen);
  ENG.exec('L\t' + E.sid(cur().id));
}
function syncCurrent() {
  if (!ENG) return;
  const ids = new Set(S.p.screens.map(s => s.id));
  for (const id of [...ENG.synced.keys()]) if (!ids.has(id)) { ENG.exec('K\t' + E.sid(id)); ENG.synced.delete(id); }
  syncScreen(cur());
  ENG.exec('L\t' + E.sid(cur().id));
  mirrorPush();
}
let last = 0, rafQ = false;
function frame(t) {
  const dt = last ? Math.min(100, t - last) : 16; last = t;
  if (ENG && !document.hidden) {
    if (ENG.tick(dt)) ENG.paint(ctx);
    if (S.mode == 'preview') {
      const a = ENG.active();
      if (a >= 0 && E.sid(cur().id) != a) { const s = S.p.screens.find(x => E.sid(x.id) == a); if (s) { S.p.cur = s.id; renderTag(); if (S.left == 'screens' || S.left == 'layers') renderLeft(); } }
    }
  }
  requestAnimationFrame(frame);
}
function measure(font, text) { return ENG ? ENG.measure(font, text) : E.measureText(font, text); }

/* ---------------- HTML fallback / hit layer ---------------- */
function arcD(cx, cy, r, a0, a1) { const p = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${(a1 - a0) > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; }
const frac = w => clamp(((+w.value) - (+w.min)) / (((+w.max) - (+w.min)) || 1), 0, 1);
function wEl(w) {
  const el = document.createElement('div'); el.className = 'w w-' + w.type; el.dataset.id = w.id;
  const st = el.style; st.left = w.x + 'px'; st.top = w.y + 'px'; st.width = w.w + 'px'; st.height = w.h + 'px'; st.opacity = (w.opacity == null ? 100 : w.opacity) / 100; if (w.hidden) el.hidden = true;
  if (engineState == 'on') return el;
  const t = w.type;
  if (t == 'label') { st.color = w.fg; st.fontSize = w.font + 'px'; st.paddingTop = E.padOf(w) + 'px'; st.justifyContent = {left: 'flex-start', center: 'center', right: 'flex-end'}[w.align] || 'flex-start'; st.textAlign = w.align; if (w.bg && w.bg != 'transparent') { st.background = w.bg; st.borderRadius = (w.radius || 0) + 'px'; st.paddingLeft = st.paddingRight = '8px'; } el.textContent = w.text; }
  else if (t == 'button') { st.background = w.bg; st.color = w.fg; st.borderRadius = w.radius + 'px'; st.fontSize = w.font + 'px'; el.textContent = w.text; }
  else if (t == 'panel') { st.background = w.bg; st.borderRadius = w.radius + 'px'; if (w.border) st.border = w.border + 'px solid ' + w.borderColor; if (w.shadow) st.boxShadow = '0 6px 24px rgba(16,24,40,.08)'; }
  else if (t == 'switch') { const k = w.h - 6; el.innerHTML = `<div class="sw-track" style="border-radius:${w.h / 2}px;background:${w.checked ? w.accent : w.bg}"></div><div class="sw-knob" style="width:${k}px;height:${k}px;left:${w.checked ? w.w - k - 3 : 3}px"></div>`; }
  else if (t == 'slider') { const f = frac(w) * 100, k = Math.max(w.h * 2.2, 18); el.innerHTML = `<div class="sl-track" style="right:0;border-radius:${w.h / 2}px;background:${w.bg}"></div><div class="sl-fill" style="width:${f}%;border-radius:${w.h / 2}px;background:${w.accent}"></div><div class="sl-knob" style="left:${f}%;width:${k}px;height:${k}px"></div>`; }
  else if (t == 'bar') { st.background = w.bg; st.borderRadius = w.radius + 'px'; st.overflow = 'hidden'; el.innerHTML = `<div style="width:${frac(w) * 100}%;height:100%;background:${w.accent};border-radius:${w.radius}px"></div>`; }
  else if (t == 'arc') { const s = Math.min(w.w, w.h), th = Math.min(w.thick, s / 2), r = s / 2 - th / 2, c = s / 2, f = frac(w); el.innerHTML = `<svg viewBox="0 0 ${s} ${s}"><path d="${arcD(c, c, r, 135, 405)}" stroke="${w.bg}" stroke-width="${th}" fill="none" stroke-linecap="round"/>${f > 0 ? `<path d="${arcD(c, c, r, 135, 135 + 270 * f)}" stroke="${w.accent}" stroke-width="${th}" fill="none" stroke-linecap="round"/>` : ''}</svg>${w.showValue ? `<div class="arc-val" style="color:${w.fg};font-size:${w.font}px">${R(+w.value)}</div>` : ''}`; }
  else if (t == 'checkbox') { const b = R(w.h * .82); el.innerHTML = `<div class="cb" style="color:${w.fg};font-size:${w.font}px"><div class="cb-box" style="width:${b}px;height:${b}px;border-radius:${R(b * .28)}px;${w.checked ? `background:${w.accent}` : 'box-shadow:inset 0 0 0 2px #C9CDD6'}"></div><span>${esc(w.text)}</span></div>`; }
  else if (t == 'icon') { el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="${w.fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${(E.ICONS[w.icon] || E.ICONS.home)[0]}</svg>`; }
  else if (t == 'dropdown') { st.background = w.bg; st.borderRadius = w.radius + 'px'; st.boxShadow = 'inset 0 0 0 1px rgba(16,24,40,.12)'; el.innerHTML = `<div class="dd" style="color:${w.fg};font-size:${w.font}px"><span>${esc(String(w.options || '').split('\n')[0])}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg></div>`; }
  else if (t == 'chart') { st.background = w.bg; st.borderRadius = w.radius + 'px'; const v = E.nums(w.data), n = Math.max(v.length, 2), mn = Math.min(...v, 0), mx = Math.max(...v, 1), pd = 8; const pts = v.map((y, i) => (pd + i * (w.w - 2 * pd) / (n - 1)).toFixed(1) + ',' + (w.h - pd - (y - mn) / ((mx - mn) || 1) * (w.h - 2 * pd)).toFixed(1)).join(' '); el.innerHTML = `<svg viewBox="0 0 ${w.w} ${w.h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${w.accent}" stroke-width="2"/></svg>`; }
  else if (t == 'spinner') { const s = Math.min(w.w, w.h), th = w.thick, r = s / 2 - th / 2, c = s / 2; el.innerHTML = `<svg viewBox="0 0 ${s} ${s}"><circle cx="${c}" cy="${c}" r="${r}" stroke="${w.bg}" stroke-width="${th}" fill="none"/><path d="${arcD(c, c, r, -90, 10)}" stroke="${w.accent}" stroke-width="${th}" fill="none" stroke-linecap="round"/></svg>`; }
  else if (t == 'led') { st.borderRadius = '50%'; st.background = w.checked ? w.accent : w.accent + '55'; }
  return el;
}

/* ---------------- canvas / stage ---------------- */
const scrEl = $('#screen'), ovl = $('#overlay'), vp = $('#viewport');
function bezel() { const b = S.p.board; return R(clamp(Math.max(b.w, b.h) * .035, 10, 26)); }
function renderCanvas() {
  const b = S.p.board, bz = bezel(), fw = b.w + 2 * bz, fh = b.h + 2 * bz, s = cur();
  const fr = $('#frame'); fr.style.width = fw + 'px'; fr.style.height = fh + 'px'; fr.style.borderRadius = b.round ? '50%' : R(bz * 1.6) + 'px';
  const sw = $('#screenwrap'); sw.style.left = bz + 'px'; sw.style.top = bz + 'px'; sw.style.width = b.w + 'px'; sw.style.height = b.h + 'px'; sw.style.borderRadius = b.round ? '50%' : R(bz * .5) + 'px';
  if (engineState != 'on') scrEl.style.background = s.bg;
  scrEl.replaceChildren(...s.widgets.map(wEl));
  renderTag(); applyZoom();
  if (engineState == 'on') syncCurrent();
}
function renderTag() { const b = S.p.board, bz = bezel(), tag = $('#boardtag'); tag.innerHTML = `<b>${esc(cur().name)}</b><span>${b.w} × ${b.h}${b.round ? ' · round' : ''}</span>`; tag.style.top = (b.h + 2 * bz + 16) + 'px'; tag.style.transform = `translateX(-50%) scale(${1 / S.zoom})`; }
function applyZoom() {
  const b = S.p.board, bz = bezel(), fw = b.w + 2 * bz, fh = b.h + 2 * bz, z = S.zoom;
  $('#stage').style.transform = `scale(${z})`; $('#stagebox').style.width = fw * z + 'px'; $('#stagebox').style.height = (fh * z + 40) + 'px';
  $('#stage').style.setProperty('--iz', 1 / z); $('#zoomV').textContent = R(z * 100) + '%'; $('#boardtag').style.transform = `translateX(-50%) scale(${1 / z})`;
  canvas.style.imageRendering = z >= 2 ? 'pixelated' : 'auto';
}
// The visible canvas is the window minus the floating panels, top bar and AI bar. The same sizes drive .stagewrap's padding.
function canvasArea() {
  const cs = getComputedStyle($('#app')), v = k => parseFloat(cs.getPropertyValue(k)) || 0, focus = $('#app').classList.contains('focus');
  const mob = innerWidth <= 900, side = mob || focus ? 0 : 48, gap = v('--gap');
  const w = vp.clientWidth - (focus ? 0 : v('--lw') + v('--rw')) - 2 * gap - 2 * side;
  const h = vp.clientHeight - (gap + v('--top') + (mob ? 16 : 40)) - (S.code ? vp.clientHeight * .42 + 40 : v('--dock') + (mob ? 16 : 60));
  return {w: Math.max(80, w), h: Math.max(80, h)};
}
function fit() { const b = S.p.board, bz = bezel(), fw = b.w + 2 * bz, fh = b.h + 2 * bz + 40, a = canvasArea(); S.zoom = Math.floor(clamp(Math.min(a.w / fw, a.h / fh), .15, 4) * 100) / 100; S.lastFit = true; applyZoom(); renderOverlay(); }
function setZoom(z, at) {
  const old = S.zoom, st = $('#stage'); let p = null;
  if (at) { const r = st.getBoundingClientRect(); p = {x: (at.x - r.left) / old, y: (at.y - r.top) / old}; }
  S.zoom = clamp(R(z * 100) / 100, .15, 8); S.lastFit = false; applyZoom(); renderOverlay();
  if (p) { const r = st.getBoundingClientRect(); vp.scrollLeft += r.left + p.x * S.zoom - at.x; vp.scrollTop += r.top + p.y * S.zoom - at.y; }
}

function issueBoxes() {
  if (S.right != 'doctor' || S.mode != 'design') return '';
  const s = cur();
  return DOC.filter(i => i.screen == s.id && i.widget).map(i => { const w = s.widgets.find(x => x.id == i.widget); return w ? `<div class="issuebox ${i.sev}" style="left:${w.x - 3}px;top:${w.y - 3}px;width:${w.w + 6}px;height:${w.h + 6}px"></div>` : ''; }).join('');
}
function renderOverlay(guides) {
  const w = selW(); let html = '';
  if (S.p.board.round && S.mode == 'design') html += '';
  html += issueBoxes();
  const hv = S.hover && S.hover != S.sel ? cur().widgets.find(x => x.id == S.hover) : null;
  if (hv && S.mode == 'design') html += `<div class="hoverbox" style="left:${hv.x}px;top:${hv.y}px;width:${hv.w}px;height:${hv.h}px"></div>`;
  if (w && S.mode == 'design' && !w.hidden) {
    html += `<div class="selbox" style="left:${w.x}px;top:${w.y}px;width:${w.w}px;height:${w.h}px"></div>`;
    if (!w.locked) { const pts = {nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5]}; for (const k in pts) { if (E.SQUARE[w.type] && k.length == 1) continue; html += `<div class="hd" data-h="${k}" style="left:${w.x + w.w * pts[k][0]}px;top:${w.y + w.h * pts[k][1]}px"></div>`; } }
    html += `<div class="sizetag" style="left:${w.x + w.w / 2}px;top:${w.y + w.h}px;margin-top:calc(8px * var(--iz))">${w.w} × ${w.h}</div>`;
  }
  for (const g of guides || []) html += g.v != null ? `<div class="guide v" style="left:${g.v}px"></div>` : `<div class="guide h" style="top:${g.h}px"></div>`;
  ovl.innerHTML = html;
}
function pt(e) { const r = scrEl.getBoundingClientRect(); return {x: (e.clientX - r.left) / S.zoom, y: (e.clientY - r.top) / S.zoom}; }
function snapMove(w, nx, ny, others) {
  const T = 6 / S.zoom, b = S.p.board, g = [], tx = [0, b.w / 2, b.w], ty = [0, b.h / 2, b.h];
  for (const o of others) { tx.push(o.x, o.x + o.w / 2, o.x + o.w); ty.push(o.y, o.y + o.h / 2, o.y + o.h); }
  let bx = null, bdx = T; for (const off of [0, w.w / 2, w.w]) for (const t of tx) { const d = Math.abs(nx + off - t); if (d < bdx) { bdx = d; bx = [t - off, t]; } }
  let by = null, bdy = T; for (const off of [0, w.h / 2, w.h]) for (const t of ty) { const d = Math.abs(ny + off - t); if (d < bdy) { bdy = d; by = [t - off, t]; } }
  if (bx) { nx = bx[0]; g.push({v: bx[1]}); } if (by) { ny = by[0]; g.push({h: by[1]}); }
  return {x: R(nx), y: R(ny), g};
}
let drag = null, liveQ = false;
function liveSync() { if (liveQ) return; liveQ = true; requestAnimationFrame(() => { liveQ = false; if (engineState == 'on') syncCurrent(); }); }
function hitAt(p) { const ws = cur().widgets; for (let i = ws.length - 1; i >= 0; i--) { const w = ws[i]; if (!w.hidden && p.x >= w.x && p.y >= w.y && p.x <= w.x + w.w && p.y <= w.y + w.h) return w; } return null; }
scrEl.addEventListener('pointerdown', e => {
  if (S.mode == 'preview') { previewPointer(e, true); return; }
  if (e.button !== 0) return;
  // Pressing on the canvas ends typing, so shortcuts like Delete and ⌘Z act on the design.
  const ae = document.activeElement; if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) ae.blur();
  const p = pt(e), w = hitAt(p);
  if (!w) { if (S.sel) { S.sel = null; renderSel(); } return; }
  if (S.sel != w.id) { S.sel = w.id; renderSel(); }
  if (w.locked) return;
  e.preventDefault();
  drag = {kind: 'move', w, sx: p.x, sy: p.y, ox: w.x, oy: w.y, moved: false, others: cur().widgets.filter(o => o.id != w.id && !o.hidden)};
  scrEl.setPointerCapture(e.pointerId);
});
scrEl.addEventListener('pointermove', e => {
  if (S.mode == 'preview') { previewPointer(e, null); return; }
  if (!drag) { const w = hitAt(pt(e)); const id = w ? w.id : null; if (id != S.hover) { S.hover = id; renderOverlay(); } return; }
  onMove(e);
});
scrEl.addEventListener('pointerleave', () => { if (S.hover) { S.hover = null; renderOverlay(); } });
ovl.addEventListener('pointerdown', e => {
  const hd = e.target.closest('.hd'); if (!hd) return; const w = selW(); if (!w) return;
  e.preventDefault(); e.stopPropagation(); const p = pt(e);
  drag = {kind: 'resize', h: hd.dataset.h, w, sx: p.x, sy: p.y, o: {x: w.x, y: w.y, w: w.w, h: w.h}, moved: false};
  ovl.setPointerCapture(e.pointerId);
});
function onMove(e) {
  if (!drag) return;
  const p = pt(e), w = drag.w, dx = p.x - drag.sx, dy = p.y - drag.sy;
  if (!drag.moved) { if (Math.hypot(dx, dy) * S.zoom < 3) return; drag.moved = true; push(); }
  let g = [];
  if (drag.kind == 'move') { const r = e.altKey ? {x: R(drag.ox + dx), y: R(drag.oy + dy), g: []} : snapMove(w, drag.ox + dx, drag.oy + dy, drag.others); w.x = r.x; w.y = r.y; g = r.g; }
  else {
    const o = drag.o, hh = drag.h; let x = o.x, y = o.y, ww = o.w, hgt = o.h;
    if (hh.includes('e')) ww = o.w + dx; if (hh.includes('s')) hgt = o.h + dy; if (hh.includes('w')) { ww = o.w - dx; x = o.x + dx; } if (hh.includes('n')) { hgt = o.h - dy; y = o.y + dy; }
    if (E.SQUARE[w.type] || e.shiftKey) { const s = Math.max(ww, hgt * (o.w / o.h)); ww = s; hgt = s * (o.h / o.w); if (hh.includes('w')) x = o.x + o.w - ww; if (hh.includes('n')) y = o.y + o.h - hgt; }
    w.w = Math.max(6, R(ww)); w.h = Math.max(4, R(hgt)); w.x = R(Math.min(x, o.x + o.w - 6)); w.y = R(Math.min(y, o.y + o.h - 4));
  }
  const el = scrEl.querySelector(`[data-id="${w.id}"]`); if (el) el.replaceWith(wEl(w));
  renderOverlay(g); liveInspector(); liveSync();
}
function onUp() { if (!drag) return; const m = drag.moved; drag = null; if (m) { save(); renderAll(); } else renderOverlay(); }
ovl.addEventListener('pointermove', onMove);
scrEl.addEventListener('pointerup', e => { if (S.mode == 'preview') { previewPointer(e, false); return; } onUp(); });
ovl.addEventListener('pointerup', onUp); scrEl.addEventListener('pointercancel', onUp); ovl.addEventListener('pointercancel', onUp);
scrEl.addEventListener('dblclick', e => { if (S.mode != 'design') return; const w = hitAt(pt(e)); if (w && 'text' in w && !w.locked) inlineEdit(w); });
function inlineEdit(w) {
  renderOverlay();
  const inp = document.createElement('input'); inp.className = 'inline-edit'; inp.value = w.text;
  Object.assign(inp.style, {left: w.x + 'px', top: w.y + 'px', width: Math.max(w.w, 80) + 'px', height: Math.max(w.h, 28) + 'px', fontSize: (w.font || 16) + 'px'});
  ovl.appendChild(inp); inp.focus(); inp.select();
  let done = false; const fin = ok => { if (done) return; done = true; if (ok && inp.value !== w.text) mutate(() => { w.text = inp.value; }); else renderOverlay(); };
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key == 'Enter') fin(true); if (e.key == 'Escape') fin(false); });
  inp.addEventListener('blur', () => fin(true));
}
let pdown = false, pdownAt = 0, prelT = 0;
function actNote(v) { const a = E.actionName(v); return a ? `Your firmware runs <code>ui_action_${a}()</code>. Write it in your own code; the export shows how.` : 'Name it, like <code>lights_on</code>, to run your own firmware code. Try it in Preview.'; }
function previewPointer(e, down) {
  if (!ENG) return;
  const p = pt(e), x = clamp(p.x, 0, BW() - 1), y = clamp(p.y, 0, BH() - 1);
  if (down === true) { clearTimeout(prelT); pdown = true; pdownAt = performance.now(); scrEl.setPointerCapture(e.pointerId); ENG.pointer(x, y, true); ENG.tick(1); return; }
  if (down === false) {
    pdown = false;
    const held = performance.now() - pdownAt, wait = Math.max(0, 70 - held);
    ENG.pointer(x, y, true);
    prelT = setTimeout(() => { ENG.pointer(x, y, false); }, wait);
    const hit = [...cur().widgets].reverse().find(w => !w.hidden && x >= w.x && y >= w.y && x < w.x + w.w && y < w.y + w.h), act = hit && E.actionOf(hit);
    if (act) toast('On your board, this runs ui_action_' + act + '()');
    return;
  }
  if (pdown) ENG.pointer(x, y, true);
}
vp.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('text/epixo')) { e.preventDefault(); $('#frame').classList.add('drop-hint'); } });
vp.addEventListener('dragleave', e => { if (e.target == vp) $('#frame').classList.remove('drop-hint'); });
vp.addEventListener('drop', e => { const t = e.dataTransfer.getData('text/epixo'); $('#frame').classList.remove('drop-hint'); if (!t) return; e.preventDefault(); addWidget(t, pt(e)); });
function addWidget(type, at) {
  const b = S.p.board, k = clamp(Math.min(b.w, b.h) / 480, .5, 1.6);
  mutate(() => {
    const d = E.TYPES[type].d, pr = {w: R(d.w * k), h: R(d.h * k)};
    if (d.font) pr.font = E.F(d.font * k); if (d.radius) pr.radius = R(d.radius * k); if (d.thick) pr.thick = Math.max(2, R(d.thick * k));
    if (type == 'switch') { pr.w = Math.max(pr.w, 44); pr.h = Math.max(pr.h, 26); }
    if (type == 'slider') { pr.w = Math.max(pr.w, 80); pr.h = Math.max(pr.h, 8); }
    pr.w = Math.min(pr.w, b.w - 8); pr.h = Math.min(pr.h, b.h - 8);
    const c = at || {x: b.w / 2, y: b.h / 2}; pr.x = R(clamp(c.x - pr.w / 2, 0, b.w - pr.w)); pr.y = R(clamp(c.y - pr.h / 2, 0, b.h - pr.h));
    if (type == 'label' || type == 'checkbox') { const tmp = Object.assign({type}, d, pr); E.fitWidget(tmp); pr.font = tmp.font; }
    const w = E.mkW(S.p, type, pr); w.name = E.uniqueWidgetName(cur(), w.name, w); cur().widgets.push(w); S.sel = w.id;
  });
  closeMob();
}
function goScreen(id) { if (!S.p.screens.some(s => s.id == id)) return; S.p.cur = id; S.sel = null; save(); renderAll(); }
function setMode(m) {
  S.mode = m; if (m == 'preview') { S.sel = null; S.hover = null; }
  $('#modepill').hidden = m != 'preview';
  $('#playBtn').classList.toggle('on', m == 'preview');
  $('#playBtn').querySelector('span').textContent = m == 'preview' ? 'Done' : 'Try it';
  $('#playBtn').querySelector('svg').innerHTML = m == 'preview' ? I.stop : I.play;
  scrEl.style.cursor = m == 'preview' ? 'pointer' : '';
  if (ENG) {
    if (m == 'preview') { syncAll(); }
    else { ENG.pointer(0, 0, false); ENG.synced.clear(); syncAll(); }
  }
  if (m == 'preview' && engineState != 'on') toast('Preview needs the LVGL engine, which is not running here.');
  renderAll();
}

/* ---------------- left panel ---------------- */
// Rendered thumbnails are kept by their exact script, so unchanged screens never render twice.
let thumbJob = 0;
const THUMBS = new Map();
async function paintThumbs(list) {
  const job = ++thumbJob, b = S.p.board, todo = [];
  for (const [cv, proj, scr] of list) {
    const key = b.w + 'x' + b.h + '|' + E.scriptScreen(proj, scr), hit = THUMBS.get(key);
    if (hit) { cv.width = b.w; cv.height = b.h; cv.getContext('2d').drawImage(hit, 0, 0); } else todo.push([cv, proj, scr, key]);
  }
  if (!todo.length) return;
  const th = await thumbEngine();
  if (!th || job != thumbJob) return;
  if (th.w != b.w || th.h != b.h) th.init(b.w, b.h);
  for (const [cv, proj, scr, key] of todo) {
    if (job != thumbJob) return;
    th.exec('X\n' + E.scriptScreen(proj, scr) + '\nL\t' + E.sid(scr.id) + '\n');
    cv.width = b.w; cv.height = b.h; th.img = null; th.renderTo(cv.getContext('2d'), 400);
    const keep = document.createElement('canvas'); keep.width = b.w; keep.height = b.h; keep.getContext('2d').drawImage(cv, 0, 0);
    THUMBS.set(key, keep); if (THUMBS.size > 120) THUMBS.delete(THUMBS.keys().next().value);
    await new Promise(r => setTimeout(r, 0));
  }
}
const TPLS = new Map();
function templatePreview(key, b) {
  const k = key + '|' + b.w + 'x' + b.h + (b.round ? 'r' : '');
  if (!TPLS.has(k)) { const tmp = E.blank(b); const ss = E.addTemplate(tmp, key, b.w, b.h, b.round); TPLS.set(k, [tmp, ss[0]]); }
  return TPLS.get(k);
}
function miniCanvas(host) { const b = S.p.board, cv = document.createElement('canvas'); if (b.round) cv.className = 'round'; cv.width = b.w; cv.height = b.h; const r = b.w / b.h; cv.style.aspectRatio = r; cv.style.width = r >= 1.6 ? '92%' : 'auto'; cv.style.height = r >= 1.6 ? 'auto' : '92%'; host.replaceChildren(cv); return cv; }
// iOS-style segmented control: one thumb slides under the chosen tab.
function segThumb(seg) {
  let t = seg.querySelector('.thumb'); if (!t) { t = document.createElement('span'); t.className = 'thumb'; seg.prepend(t); }
  const on = seg.querySelector('button.on'); if (!on || !on.offsetWidth) return;
  t.style.left = on.offsetLeft + 'px'; t.style.width = on.offsetWidth + 'px';
}
const shown = {left: null, right: null};
function swapIn(el, side, tab) { if (shown[side] != tab) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); shown[side] = tab; } }
function renderLeft() {
  document.querySelectorAll('#leftTabs button').forEach(b => b.classList.toggle('on', b.dataset.t == S.left));
  segThumb($('#leftTabs'));
  const body = $('#leftBody'), t = S.left;
  swapIn(body, 'left', t);
  if (t == 'widgets') {
    const q = S.q.toLowerCase(), groups = [['basic', 'Basics'], ['ctl', 'Controls'], ['data', 'Data and status']];
    body.innerHTML = `<label class="search">${ico(I.search)}<input id="wq" placeholder="Search widgets" value="${esc(S.q)}" autocomplete="off"></label>` +
      groups.map(([g, n]) => { const items = Object.entries(E.TYPES).filter(([k, v]) => v.g == g && (!q || v.n.toLowerCase().includes(q) || k.includes(q))); if (!items.length) return ''; return `<div class="grp">${n}</div><div class="tiles">${items.map(([k, v]) => `<div class="tile" draggable="true" data-type="${k}" data-g="${g}" tabindex="0" role="button" aria-label="Add ${v.n}"><div class="ti">${ico(v.i)}</div>${v.n}</div>`).join('')}</div>`; }).join('') +
      `<p class="hint">Drag onto the screen or tap to drop it in the centre. Every widget is a real LVGL object, drawn by LVGL itself.</p>`;
    const wq = $('#wq'); wq.addEventListener('input', () => { S.q = wq.value; const pos = wq.selectionStart; renderLeft(); const n = $('#wq'); n.focus(); n.setSelectionRange(pos, pos); });
    body.querySelectorAll('.tile').forEach(el => { el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/epixo', el.dataset.type); e.dataTransfer.effectAllowed = 'copy'; }); el.addEventListener('click', () => addWidget(el.dataset.type)); el.addEventListener('keydown', e => { if (e.key == 'Enter') addWidget(el.dataset.type); }); });
  } else if (t == 'layers') {
    const ws = [...cur().widgets].reverse();
    body.innerHTML = ws.length ? `<div class="grp">${esc(cur().name)}<span>${ws.length} layers</span></div><div class="rows">${ws.map(w => `<div class="row${w.id == S.sel ? ' sel' : ''}${w.hidden ? ' dim' : ''}" data-id="${w.id}">${ico(E.TYPES[w.type].i)}<span class="nm">${esc(w.name)}</span>
      <button class="rb" data-a="up" title="Bring forward">${ico(I.up)}</button><button class="rb" data-a="down" title="Send backward">${ico(I.down)}</button>
      <button class="rb${w.locked ? ' lit' : ''}" data-a="lock" title="${w.locked ? 'Unlock' : 'Lock'}">${ico(w.locked ? I.lock : I.unlock)}</button>
      <button class="rb${w.hidden ? ' lit' : ''}" data-a="eye" title="${w.hidden ? 'Show' : 'Hide'}">${ico(w.hidden ? I.eyeoff : I.eye)}</button></div>`).join('')}</div><p class="hint">Top of the list draws on top. Double-click a name to rename it; names become C variable names.</p>`
      : `<p class="hint">This screen is empty. Add a widget from the Widgets tab or press ⌘K.</p>`;
    body.querySelectorAll('.row').forEach(r => {
      const w = cur().widgets.find(x => x.id == r.dataset.id);
      r.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (a) { e.stopPropagation(); const arr = cur().widgets, i = arr.indexOf(w);
        if (a.dataset.a == 'eye') mutate(() => w.hidden = !w.hidden); else if (a.dataset.a == 'lock') mutate(() => w.locked = !w.locked);
        else if (a.dataset.a == 'up' && i < arr.length - 1) mutate(() => { arr.splice(i, 1); arr.splice(i + 1, 0, w); }); else if (a.dataset.a == 'down' && i > 0) mutate(() => { arr.splice(i, 1); arr.splice(i - 1, 0, w); }); return; }
        S.sel = w.id; renderSel(); });
      r.addEventListener('mouseenter', () => { S.hover = w.id; renderOverlay(); });
      r.addEventListener('mouseleave', () => { S.hover = null; renderOverlay(); });
      r.addEventListener('dblclick', e => { if (e.target.closest('[data-a]')) return; const nm = r.querySelector('.nm'), inp = h(`<input class="renamer" value="${esc(w.name)}">`); nm.replaceWith(inp); inp.focus(); inp.select();
        const fin = () => { const v = inp.value.replace(/[^A-Za-z0-9_]/g, '') ? E.uniqueWidgetName(S.p.screens.find(x => x.widgets.includes(w)) || cur(), inp.value, w) : w.name; if (v != w.name) mutate(() => w.name = v); else renderLeft(); };
        inp.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key == 'Enter') inp.blur(); if (ev.key == 'Escape') { inp.value = w.name; inp.blur(); } }); inp.addEventListener('blur', fin); });
    });
  } else if (t == 'screens') {
    body.innerHTML = `<div class="grp">Screens<span>${S.p.screens.length}</span></div><div class="scards">${S.p.screens.map((s, i) => `<div class="scard${s.id == S.p.cur ? ' on' : ''}" data-id="${s.id}" role="button" tabindex="0"><div class="mini" data-mini="${s.id}"></div><div class="meta"><b>${esc(s.name)}</b><span>${s.widgets.length}</span>
      <button class="rb lit" data-a="dup" title="Duplicate">${ico(I.dup)}</button>${S.p.screens.length > 1 ? `<button class="rb lit" data-a="del" title="Delete">${ico(I.trash)}</button>` : ''}</div></div>`).join('')}</div><button class="ghost" id="addScr">${ico(I.plus)}New screen</button>`;
    const jobs = [];
    body.querySelectorAll('[data-mini]').forEach(m => { const s = S.p.screens.find(x => x.id == m.dataset.mini); jobs.push([miniCanvas(m), S.p, s]); });
    paintThumbs(jobs);
    body.querySelectorAll('.scard').forEach(c => c.addEventListener('click', e => {
      const id = c.dataset.id, a = e.target.closest('[data-a]');
      if (a && a.dataset.a == 'dup') { mutate(() => { const s = S.p.screens.find(x => x.id == id), n = JSON.parse(JSON.stringify(s)); n.id = 's' + (++S.p.seq); n.name = E.uniqueName(S.p, s.name + ' copy'); n.widgets.forEach(w => w.id = 'w' + (++S.p.seq)); S.p.screens.splice(S.p.screens.indexOf(s) + 1, 0, n); S.p.cur = n.id; S.sel = null; }); return; }
      if (a && a.dataset.a == 'del') { confirmSheet('Delete this screen?', 'Its widgets go with it. ⌘Z brings it back.', 'Delete', () => mutate(() => { S.p.screens = S.p.screens.filter(x => x.id != id); S.p.screens.forEach(s => s.widgets.forEach(w => { if (w.onTap && w.onTap.to == id) w.onTap = null; })); fixSel(); S.sel = null; })); return; }
      if (id != S.p.cur) { goScreen(id); closeMob(); }
    }));
    $('#addScr').onclick = () => mutate(() => { const s = E.mkScreen(S.p, 'Screen', cur().bg); S.p.cur = s.id; S.sel = null; });
  } else if (t == 'templates') {
    const b = S.p.board;
    body.innerHTML = `<div class="grp">Fitted to ${b.w} × ${b.h}${b.round ? ' round' : ''}</div><div class="scards">${Object.entries(E.TPL).map(([k, v]) => `<div class="scard" data-k="${k}" tabindex="0" role="button"><div class="mini" data-tmini="${k}"></div><div class="meta col"><b>${v.n}</b><span>${v.d}</span></div></div>`).join('')}</div><p class="hint">Templates rebuild themselves for your board, and text is sized with Montserrat's real glyph widths so it fits.</p>`;
    const jobs = [];
    body.querySelectorAll('[data-tmini]').forEach(m => { const [tmp, scr] = templatePreview(m.dataset.tmini, b); jobs.push([miniCanvas(m), tmp, scr]); });
    paintThumbs(jobs);
    body.querySelectorAll('[data-k]').forEach(c => { const go = () => { mutate(() => { const ss = E.addTemplate(S.p, c.dataset.k, b.w, b.h, b.round); S.p.cur = ss[0].id; S.sel = null; }); toast('Added ' + E.TPL[c.dataset.k].n); closeMob(); }; c.addEventListener('click', go); c.addEventListener('keydown', e => { if (e.key == 'Enter') go(); }); });
  }
}

/* ---------------- right panel ---------------- */
const FLD = {text:['Text','text'],options:['Options','area'],data:['Values','text'],fg:['Text colour','color'],bg:['Fill','color'],accent:['Accent','color'],borderColor:['Border colour','color'],
  font:['Font size','font'],align:['Align','align'],valign:['Vertical','valign'],radius:['Corner radius','range',0,240],thick:['Thickness','range',1,80],border:['Border','range',0,12],
  value:['Value','num'],min:['Min','num'],max:['Max','num'],checked:['On','toggle'],showValue:['Show value','toggle'],shadow:['Shadow','toggle'],icon:['Symbol','icon']};
const TF = {label:['text','fg','font','align','valign','bg','radius'],button:['text','bg','fg','font','radius'],switch:['checked','accent','bg'],slider:['value','min','max','accent','bg'],
  arc:['value','min','max','thick','showValue','accent','bg','fg','font'],bar:['value','min','max','accent','bg','radius'],checkbox:['text','checked','accent','fg','font'],
  panel:['bg','radius','shadow','border','borderColor'],icon:['icon','fg'],dropdown:['options','bg','fg','font','radius'],chart:['data','accent','bg','radius'],spinner:['accent','bg','thick'],led:['checked','accent']};
function colorF(k, v, allowNone) { const none = !v || v == 'transparent'; return `<div class="color"><label class="swatch${none ? ' none' : ''}" style="${none ? '' : 'background:' + v}"><input type="color" data-k="${k}" value="${none ? '#ffffff' : v}" aria-label="Pick colour"></label><input class="fld" data-k="${k}" data-hex value="${none ? 'none' : esc(v).toUpperCase()}" spellcheck="false">${allowNone && !none ? `<button class="rb lit" data-clear="${k}" title="No fill">${ico(I.close)}</button>` : ''}</div>`; }
function fieldHTML(w, k) {
  const [lab, kind, a, b] = FLD[k], v = w[k]; let ctl = '';
  if (kind == 'text') ctl = `<input class="fld" data-k="${k}" value="${esc(v)}">`;
  else if (kind == 'area') return `<div class="f col" style="margin-top:8px"><span class="lbl">${lab}</span><textarea class="fld" data-k="${k}" rows="3">${esc(v)}</textarea></div>`;
  else if (kind == 'color') ctl = colorF(k, v, w.type == 'label' && k == 'bg');
  else if (kind == 'num') ctl = `<input class="fld" type="number" data-k="${k}" value="${v}">`;
  else if (kind == 'range') { const mx = k == 'radius' ? Math.max(b, R(Math.min(w.w, w.h) / 2)) : b; ctl = `<div class="rangef"><input type="range" min="${a}" max="${mx}" data-k="${k}" value="${v || 0}"><span>${v || 0}</span></div>`; }
  else if (kind == 'toggle') ctl = `<button class="toggle${v ? ' on' : ''}" data-tg="${k}" role="switch" aria-checked="${!!v}" aria-label="${lab}"></button>`;
  else if (kind == 'font') ctl = `<select class="fld" data-k="${k}">${E.FONTS.map(f => `<option value="${f}"${f == v ? ' selected' : ''}>Montserrat ${f} · ${FONT_KB[f]} KB</option>`).join('')}</select>`;
  else if (kind == 'align') ctl = `<div class="radio">${['left', 'center', 'right'].map(x => `<button data-al="${x}" class="${v == x ? 'on' : ''}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>`;
  else if (kind == 'valign') ctl = `<div class="radio">${['top', 'center', 'bottom'].map(x => `<button data-va="${x}" class="${(v || 'top') == x ? 'on' : ''}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>`;
  else if (kind == 'icon') return `<div class="f col"><span class="lbl">${lab}</span><div class="iconpick">${Object.keys(E.ICONS).map(n => `<button data-ic="${n}" class="${v == n ? 'on' : ''}" title="${n}"><svg class="i st" viewBox="0 0 24 24">${E.ICONS[n][0]}</svg></button>`).join('')}</div></div>`;
  return `<div class="frow"><span class="lbl">${lab}</span>${ctl}</div>`;
}
let insPushed = null;
const rb = $('#rightBody');
rb.addEventListener('focusin', e => { if (e.target.matches('.fld,input') && insPushed !== S.sel + e.target.dataset.k) { insPushed = S.sel + e.target.dataset.k; push(); } });
rb.addEventListener('focusout', () => { insPushed = null; });
function renderRight() {
  document.querySelectorAll('#rightTabs button').forEach(b => b.classList.toggle('on', b.dataset.t == S.right));
  updateDocBadge(); segThumb($('#rightTabs')); swapIn(rb, 'right', S.right);
  if (S.right == 'design') renderInspector(); else if (S.right == 'doctor') renderDoctor(); else renderDevice();
}
function renderInspector() {
  const w = selW();
  if (!w) {
    const s = cur(), b = S.p.board, V = E.VERIFY[b.v] || E.VERIFY.spec;
    rb.innerHTML = `<div class="insp-h"><div class="ti">${ico(I.screen)}</div><div style="flex:1;min-width:0"><input id="scrName" value="${esc(s.name)}" aria-label="Screen name"><small>Screen · ${s.widgets.length} widgets</small></div></div>
    <div class="sec"><h4>Background</h4>${colorF('__bg', s.bg)}</div>
    <div class="sec"><h4>One-tap themes</h4><div class="themes">${E.THEMES.map((t, i) => `<button class="theme" data-th="${i}"><i style="background:${t.bg}"><b style="background:${t.card}"></b><b style="background:${t.acc}"></b><b style="background:${t.card}"></b><b style="background:${t.ink}"></b></i>${t.n}</button>`).join('')}</div></div>
    <div class="sec"><h4>Board <button class="tbtn" id="chgBoard" style="height:24px;font-size:11px;color:var(--accent)">Change</button></h4>
      <dl class="kv"><dt>Maker</dt><dd>${esc(b.brand)}</dd><dt>Model</dt><dd>${esc(b.name)}</dd><dt>Display</dt><dd>${b.size} ${b.panel}${b.round ? ' · round' : ''}</dd><dt>Resolution</dt><dd>${b.w} × ${b.h}${b.rot == 90 ? ' (rotated)' : ''}</dd><dt>Chip</dt><dd>${esc(b.chip)}</dd>${b.lcd ? `<dt>LCD driver</dt><dd>${esc(b.lcd)}</dd>` : ''}${b.tp ? `<dt>Touch</dt><dd>${esc(b.tp)}</dd>` : `<dt>Touch</dt><dd>${b.touch ? 'Yes' : 'No'}</dd>`}<dt>Board pack</dt><dd>${b.pack ? (b.pack.startsWith('espanel') ? 'ESP32_Display_Panel' : 'esp32-smartdisplay') : 'UI files only'}</dd></dl>
      <p class="note"><span class="vchip ${b.v || 'spec'}">${V.label}</span> ${V.note}${b.src ? ` <a href="${esc(b.src)}" target="_blank" rel="noopener">Source</a>` : ''}</p></div>
    <div class="sec"><h4>Shortcuts</h4><div class="keys"><span>Command menu</span><kbd>⌘K</kbd><span>Try it on LVGL</span><kbd>P</kbd><span>Ask AI</span><kbd>/</kbd><span>Focus mode</span><kbd>\\</kbd><span>Pan the canvas</span><kbd>Space drag</kbd><span>Duplicate</span><kbd>⌘D</kbd><span>Nudge 1 / 10 px</span><kbd>← ⇧←</kbd><span>Free move (no snap)</span><kbd>⌥ drag</kbd><span>Fit to view</span><kbd>⇧1</kbd><span>Zoom to the pointer</span><kbd>⌘ scroll</kbd></div></div>`;
    const sn = $('#scrName'); sn.addEventListener('change', () => { s.name = E.uniqueName({screens: S.p.screens.filter(x => x != s)}, sn.value); save(); renderAll(); });
    rb.querySelectorAll('[data-th]').forEach(x => x.onclick = () => applyTheme(E.THEMES[x.dataset.th]));
    $('#chgBoard').onclick = openBoards;
    bindColor(rb, (k, v) => { s.bg = v; liveSync(); }, () => { save(); renderAll(); });
    return;
  }
  const t = E.TYPES[w.type], fields = TF[w.type], targets = S.p.screens.filter(s => s.id != S.p.cur);
  rb.innerHTML = `<div class="insp-h"><div class="ti">${ico(t.i)}</div><div style="flex:1;min-width:0"><input id="wName" value="${esc(w.name)}" aria-label="Widget name"><small>${t.n} · ${t.lv}</small></div></div>
  <div class="sec"><h4>Layout</h4><div class="g2">${['x', 'y', 'w', 'h'].map(k => `<div class="f"><label class="scrub" data-scrub="${k}">${k.toUpperCase()}</label><input class="fld" type="number" data-k="${k}" value="${w[k]}"></div>`).join('')}</div>
    <div class="aligns">${[['l','<path d="M48,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Zm16,64V64A16,16,0,0,1,80,48h96a16,16,0,0,1,16,16v40a16,16,0,0,1-16,16H80A16,16,0,0,1,64,104Zm16,0h96V64H80Zm152,48v40a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V152a16,16,0,0,1,16-16H216A16,16,0,0,1,232,152Zm-16,40V152H80v40H216Z"/>','Align left'],['c','<path d="M208,136H136V120h48a16,16,0,0,0,16-16V64a16,16,0,0,0-16-16H136V32a8,8,0,0,0-16,0V48H72A16,16,0,0,0,56,64v40a16,16,0,0,0,16,16h48v16H48a16,16,0,0,0-16,16v40a16,16,0,0,0,16,16h72v16a8,8,0,0,0,16,0V208h72a16,16,0,0,0,16-16V152A16,16,0,0,0,208,136ZM72,64H184v40H72ZM208,192H48V152H208v40Z"/>','Centre horizontally'],['r','<path d="M224,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0ZM192,64v40a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V64A16,16,0,0,1,80,48h96A16,16,0,0,1,192,64Zm-16,0H80v40h96Zm16,88v40a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V152a16,16,0,0,1,16-16H176A16,16,0,0,1,192,152Zm-16,0H40v40H176Z"/>','Align right'],['t','<path d="M224,40a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40ZM208,80v96a16,16,0,0,1-16,16H152a16,16,0,0,1-16-16V80a16,16,0,0,1,16-16h40A16,16,0,0,1,208,80Zm-16,0H152v96h40Zm-72,0V216a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V80A16,16,0,0,1,64,64h40A16,16,0,0,1,120,80Zm-16,0H64V216h40Z"/>','Align top'],['m','<path d="M224,120H208V72a16,16,0,0,0-16-16H152a16,16,0,0,0-16,16v48H120V48a16,16,0,0,0-16-16H64A16,16,0,0,0,48,48v72H32a8,8,0,0,0,0,16H48v72a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V136h16v48a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V136h16a8,8,0,0,0,0-16ZM104,208H64V48h40Zm88-24H152V72h40Z"/>','Centre vertically'],['b','<path d="M224,216a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,216Zm-88-40V80a16,16,0,0,1,16-16h40a16,16,0,0,1,16,16v96a16,16,0,0,1-16,16H152A16,16,0,0,1,136,176Zm16,0h40V80H152ZM48,176V40A16,16,0,0,1,64,24h40a16,16,0,0,1,16,16V176a16,16,0,0,1-16,16H64A16,16,0,0,1,48,176Zm16,0h40V40H64Z"/>','Align bottom']].map(a => `<button data-align="${a[0]}" title="${a[2]}">${ico(a[1])}</button>`).join('')}</div></div>
  <div class="sec"><h4>${w.type == 'icon' ? 'Symbol' : 'Content and style'}</h4>${fields.map(k => fieldHTML(w, k)).join('')}<div class="frow"><span class="lbl">Opacity</span><div class="rangef"><input type="range" min="0" max="100" data-k="opacity" value="${w.opacity == null ? 100 : w.opacity}"><span>${w.opacity == null ? 100 : w.opacity}</span></div></div></div>
  ${E.ACTION_EVENT[w.type] ? `<div class="sec"><h4>${E.TAPPABLE[w.type] ? 'On tap' : 'When it changes'}</h4>${E.TAPPABLE[w.type] ? `<div class="frow"><span class="lbl">Go to</span><select class="fld" id="tapTo"><option value="">Nothing</option>${targets.map(s => `<option value="${s.id}"${w.onTap && w.onTap.to == s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
    <div class="frow"><span class="lbl">Transition</span><select class="fld" id="tapAnim">${E.ANIMS.map(a => `<option value="${a[0]}"${w.onTap && w.onTap.anim == a[0] ? ' selected' : ''}>${a[1]}</option>`).join('')}</select></div>` : ''}
    <div class="frow"><span class="lbl">Run code</span><input class="fld mono" id="wAct" value="${esc(w.action || '')}" placeholder="lights_on" spellcheck="false" autocomplete="off" autocapitalize="off" maxlength="32"></div><p class="note" id="actNote">${actNote(w.action)}</p></div>` : ''}
  <div class="sec"><div class="g2"><button class="btn2" style="margin:0" id="dupW">${ico(I.dup)}Duplicate</button><button class="btn2 danger" style="margin:0" id="delW">${ico(I.trash)}Delete</button></div></div>`;
  const live = () => { const el = scrEl.querySelector(`[data-id="${w.id}"]`); if (el) el.replaceWith(wEl(w)); renderOverlay(); liveSync(); queueCode(); };
  rb.querySelectorAll('[data-k]:not([data-hex]):not([type=color])').forEach(inp => { const k = inp.dataset.k; inp.addEventListener('input', () => { let v = inp.value;
    if (['x', 'y', 'w', 'h', 'value', 'min', 'max', 'radius', 'thick', 'border', 'opacity', 'font'].includes(k)) v = +v || 0; if (['w', 'h'].includes(k)) v = Math.max(4, v);
    if (E.SQUARE[w.type] && (k == 'w' || k == 'h')) { w.w = w.h = v; } else w[k] = v;
    const sp = inp.parentElement.querySelector('span'); if (inp.type == 'range' && sp) sp.textContent = v; live(); }); inp.addEventListener('change', () => { save(); if (S.left == 'layers' || S.left == 'screens') renderLeft(); refreshDoc(); }); });
  bindColor(rb, (k, v) => { w[k] = v; live(); }, () => { save(); renderInspector(); refreshDoc(); });
  rb.querySelectorAll('[data-clear]').forEach(b => b.onclick = () => mutate(() => { w[b.dataset.clear] = 'transparent'; }));
  rb.querySelectorAll('[data-tg]').forEach(b => b.onclick = () => mutate(() => { w[b.dataset.tg] = !w[b.dataset.tg]; }));
  rb.querySelectorAll('[data-al]').forEach(b => b.onclick = () => mutate(() => { w.align = b.dataset.al; }));
  rb.querySelectorAll('[data-va]').forEach(b => b.onclick = () => mutate(() => { w.valign = b.dataset.va; }));
  rb.querySelectorAll('[data-ic]').forEach(b => b.onclick = () => mutate(() => { w.icon = b.dataset.ic; }));
  rb.querySelectorAll('[data-align]').forEach(b => b.onclick = () => mutate(() => { const B = S.p.board, a = b.dataset.align; if (a == 'l') w.x = 0; if (a == 'c') w.x = R((B.w - w.w) / 2); if (a == 'r') w.x = B.w - w.w; if (a == 't') w.y = 0; if (a == 'm') w.y = R((B.h - w.h) / 2); if (a == 'b') w.y = B.h - w.h; }));
  const wn = $('#wName'); wn.addEventListener('change', () => { if (wn.value.replace(/[^A-Za-z0-9_]/g, '')) w.name = E.uniqueWidgetName(cur(), wn.value, w); save(); renderAll(); });
  const wa = $('#wAct'); if (wa) { wa.oninput = () => { $('#actNote').innerHTML = actNote(wa.value); }; wa.onchange = () => mutate(() => { const a = E.actionName(wa.value); if (a) w.action = a; else delete w.action; }); }
  const tt = $('#tapTo'); if (tt) { tt.onchange = () => mutate(() => { w.onTap = tt.value ? {to: tt.value, anim: (w.onTap && w.onTap.anim) || 'move_left'} : null; }); $('#tapAnim').onchange = e => mutate(() => { if (w.onTap) w.onTap.anim = e.target.value; }); }
  $('#dupW').onclick = dup; $('#delW').onclick = del;
  rb.querySelectorAll('[data-scrub]').forEach(l => l.addEventListener('pointerdown', e => { e.preventDefault(); const k = l.dataset.scrub, sx = e.clientX, o = w[k]; push(); l.setPointerCapture(e.pointerId);
    const mv = ev => { let v = R(o + (ev.clientX - sx) * (ev.shiftKey ? 5 : 1)); if (k == 'w' || k == 'h') v = Math.max(4, v); if (E.SQUARE[w.type] && (k == 'w' || k == 'h')) w.w = w.h = v; else w[k] = v; liveInspector(); live(); };
    const up = () => { l.removeEventListener('pointermove', mv); l.removeEventListener('pointerup', up); save(); renderAll(); }; l.addEventListener('pointermove', mv); l.addEventListener('pointerup', up); }));
}
function bindColor(root, set, done) {
  root.querySelectorAll('input[type=color]').forEach(inp => { inp.addEventListener('input', () => { set(inp.dataset.k, inp.value.toUpperCase()); const sw = inp.parentElement; sw.classList.remove('none'); sw.style.background = inp.value; const hx = sw.parentElement.querySelector('[data-hex]'); if (hx) hx.value = inp.value.toUpperCase(); }); inp.addEventListener('change', done); });
  root.querySelectorAll('[data-hex]').forEach(inp => inp.addEventListener('change', () => { let v = inp.value.trim(); if (/^[0-9a-f]{6}$/i.test(v)) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) { set(inp.dataset.k, v.toUpperCase()); done(); } else done(); }));
}
function liveInspector() { const w = selW(); if (!w || S.right != 'design') return; ['x', 'y', 'w', 'h'].forEach(k => { const i = rb.querySelector(`input[data-k="${k}"]`); if (i && document.activeElement !== i) i.value = w[k]; }); }
function applyTheme(t) {
  mutate(() => E.applyTheme(cur(), t));
  toast(t.n + ' theme applied to ' + cur().name);
}

/* ---------------- Design Doctor ---------------- */
let DOC = [];
function refreshDoc() { DOC = E.doctor(S.p, measure); updateDocBadge(); if (S.right == 'doctor') renderDoctor(); }
function updateDocBadge() {
  const er = DOC.filter(i => i.sev == 'error').length, wn = DOC.filter(i => i.sev == 'warn').length;
  const b = document.querySelector('#rightTabs [data-t="doctor"]');
  b.innerHTML = 'Doctor' + (er ? `<em>${er}</em>` : wn ? `<em class="warn">${wn}</em>` : '<em class="ok">✓</em>');
  segThumb($('#rightTabs'));
}
function renderDoctor() {
  const er = DOC.filter(i => i.sev == 'error').length, wn = DOC.filter(i => i.sev == 'warn').length, inf = DOC.filter(i => i.sev == 'info').length;
  const score = Math.max(0, 100 - er * 15 - wn * 5 - inf);
  const col = score >= 85 ? 'var(--ok)' : score >= 60 ? 'var(--warn)' : 'var(--bad)';
  const C = 2 * Math.PI * 22, mem = E.memoryReport(S.p);
  const sorted = [...DOC].sort((a, b) => (a.screen == S.p.cur ? 0 : 1) - (b.screen == S.p.cur ? 0 : 1) || ({error: 0, warn: 1, info: 2}[a.sev] - {error: 0, warn: 1, info: 2}[b.sev]));
  const fixable = DOC.filter(i => i.fix && i.sev != 'info');
  rb.innerHTML = `<div class="doc-sum"><svg class="ring" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="#EEF0F4" stroke-width="6"/><circle cx="26" cy="26" r="22" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C * score / 100} ${C}" transform="rotate(-90 26 26)"/><text x="26" y="31" text-anchor="middle" font-size="14" font-weight="700" fill="${col}" font-family="var(--f-ui)">${score}</text></svg>
    <div style="min-width:0"><b>${er ? 'Needs fixes before you ship' : wn ? 'Almost ready' : 'Ready for the device'}</b><small>${er} errors · ${wn} warnings · ${inf} tips. Text is measured with LVGL's own font engine.</small></div></div>
    ${fixable.length ? `<div style="margin:0 12px 10px"><button class="btn2" id="fixAll" style="margin:0">${ico(I.wand)}Fix ${fixable.length} automatically</button></div>` : ''}
    <div class="issues">${sorted.map((i, n) => { const s = S.p.screens.find(x => x.id == i.screen); return `<div class="issue ${i.sev}" data-n="${n}" role="button" tabindex="0"><span class="sv"></span><p>${esc(i.msg)}</p><small>${s ? esc(s.name) : 'Project'}${i.fix ? `<button class="fix" data-fix="${n}">Fix</button>` : ''}</small></div>`; }).join('') || '<p class="hint" style="margin:4px 4px 0">No problems found. Every widget is on screen, readable and big enough to tap.</p>'}</div>
    <div class="sec"><h4>Device budget</h4><div class="mem">
      <span>Fonts in flash (${mem.fonts.length} sizes)</span><b>${mem.flashFontsKB} KB</b>
      <span>UI objects in RAM</span><b>≈ ${mem.uiRamKB} KB</b>
      <span>Suggested LV_MEM_SIZE</span><b>${mem.lvMemKB} KB</b>
      <span>Partial draw buffer (1/10)</span><b>${mem.partialBufKB} KB</b>
      <span>Full frame buffer</span><b>${mem.fullFrameKB} KB</b>
      <div class="full meter"><i style="width:${Math.min(100, mem.fullFrameKB / 80)}%"></i></div>
      <p class="note full" style="margin:0">${mem.fullFrameKB > 320 ? 'A full frame needs PSRAM. Boards in this class (S3 with RGB panels) have it.' : 'Fits comfortably in internal RAM with a partial buffer.'}</p></div></div>`;
  rb.querySelectorAll('.issue').forEach(el => { const i = sorted[+el.dataset.n]; el.addEventListener('click', e => { if (e.target.closest('[data-fix]')) return; if (i.screen && i.screen != S.p.cur) S.p.cur = i.screen; S.sel = i.widget || null; renderAll(); }); });
  rb.querySelectorAll('[data-fix]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = sorted[+b.dataset.fix]; mutate(() => E.applyFix(S.p, i, measure)); toast('Fixed'); });
  const fa = $('#fixAll'); if (fa) fa.onclick = () => { let n = 0; mutate(() => { for (let pass = 0; pass < 3; pass++) E.doctor(S.p, measure).filter(i => i.fix && i.sev != 'info').forEach(i => { if (E.applyFix(S.p, i, measure)) n++; }); }); toast('Applied ' + n + ' fixes'); };
}

/* ---------------- Device / Live Mirror ---------------- */
const MIR = {port: null, writer: null, on: false, err: ''};
const serialOK = () => 'serial' in navigator;
function renderDevice() {
  const b = S.p.board, pack = E.packOf(b);
  rb.innerHTML = `<div class="sec"><h4>Live Mirror</h4>
    <div class="dev-state${MIR.on ? ' on' : ''}"><i></i><div><b>${MIR.on ? 'Mirroring to your board' : 'Not connected'}</b><small>${MIR.on ? 'Every edit appears on the real screen in about a tenth of a second.' : MIR.err ? esc(MIR.err) : 'Flash the Epixo runtime once, then edits stream over USB.'}</small></div></div>
    <button class="primary" id="mirBtn" style="width:100%;margin-top:10px">${ico(I.usb)}${MIR.on ? 'Disconnect' : 'Connect board over USB'}</button>
    ${MIR.on ? '<button class="btn2" id="mirPush">Send the whole project again</button>' : ''}
    <p class="note">${serialOK() ? 'Uses Web Serial in Chrome or Edge.' : 'This view cannot reach USB devices. Live Mirror works in Chrome or Edge when you run the editor from the exported project folder (see its README).'}</p></div>
    <div class="sec"><h4>Runtime firmware</h4>
    ${pack ? `<p class="note" style="margin:0 0 4px">A ready PlatformIO project for <b>${esc(b.name)}</b> using ${pack.kind == 'espanel' ? 'Espressif\'s ESP32_Display_Panel driver (LVGL 8.4)' : 'the esp32-smartdisplay driver (LVGL 9)'} plus the Epixo runtime.</p>
      <ol class="steps"><li>Export with “Live Mirror firmware” ticked.</li><li>Open <code>live-mirror/</code> in VS Code with PlatformIO and press Upload.</li><li>Come back here and press Connect.</li></ol>
      <button class="btn2" id="fwBtn">${ico(I.dl)}Export firmware project</button>`
      : `<p class="note" style="margin:0">This board has no driver pack yet. Export the runtime source (<code>epixo_rt.c</code>) and call <code>epixo_rt_line()</code> with each line received over serial after your own display setup.</p><button class="btn2" id="fwBtn">${ico(I.dl)}Export runtime source</button>`}
    <p class="note">The runtime is the same C code that draws this editor's canvas, compiled for your board.</p></div>
    <div class="sec"><h4>AI apps</h4><p class="note" style="margin:0">${document.querySelector('.livepill') ? 'This editor is linked to your AI app through the Epixo MCP server. Ask Claude or ChatGPT for a screen and watch it appear here.' : window.EPX_HOSTED ? 'Let Claude or ChatGPT design here. Connect them once, then ask for a screen in plain words and watch it build in this editor.' : 'Claude, ChatGPT and other AI apps can design here through the Epixo MCP server in <code>apps/mcp</code>. Run it and open the editor it serves to watch them work live.'}</p>${window.EPX_HOSTED ? `<a class="btn2" href="/connect" target="_blank" rel="noopener" style="text-decoration:none">${ico(I.spark)}Connect Claude or ChatGPT</a>` : ''}</div>
    <div class="sec"><h4>Protocol</h4><p class="note" style="margin:0">Plain text lines over serial: <code>S</code> screen, <code>W</code> widget, <code>P</code> property, <code>E</code> end, <code>L</code> load. Any tool can drive it, including your own scripts.</p></div>`;
  $('#mirBtn').onclick = () => MIR.on ? mirrorClose() : mirrorOpen();
  const mp = $('#mirPush'); if (mp) mp.onclick = () => mirrorSend(E.toScript(S.p));
  $('#fwBtn').onclick = () => openExport(['runtime']);
}
async function mirrorOpen() {
  MIR.err = '';
  if (!serialOK()) { MIR.err = 'Web Serial is not available in this view.'; renderDevice(); return; }
  try {
    MIR.port = await navigator.serial.requestPort();
    await MIR.port.open({baudRate: 921600});
    MIR.writer = MIR.port.writable.getWriter();
    MIR.on = true; renderDevice();
    await mirrorSend(E.toScript(S.p));
    toast('Connected. Your board now mirrors the editor.');
  } catch (e) { MIR.on = false; MIR.err = e && e.name == 'NotFoundError' ? 'No port was chosen.' : e && e.name == 'SecurityError' ? 'This view is not allowed to use USB. Run the exported editor locally.' : 'Could not open the port: ' + (e && e.message || e); renderDevice(); }
}
async function mirrorClose() { try { MIR.writer && MIR.writer.releaseLock(); await MIR.port.close(); } catch (e) {} MIR.on = false; MIR.port = MIR.writer = null; renderDevice(); }
const enc = new TextEncoder();
let mirQ = Promise.resolve();
function mirrorSend(text) { if (!MIR.on || !MIR.writer) return Promise.resolve(); mirQ = mirQ.then(() => MIR.writer.write(enc.encode(text))).catch(e => { MIR.on = false; MIR.err = 'The board disconnected.'; renderDevice(); }); return mirQ; }
let mirT;
function mirrorPush() { if (!MIR.on) return; clearTimeout(mirT); mirT = setTimeout(() => mirrorSend(E.scriptScreen(S.p, cur()) + '\nL\t' + E.sid(cur().id) + '\n'), 90); }

/* ---------------- code panel ---------------- */
const LVT = [[8, 'LVGL 8.3 / 8.4'], [9, 'LVGL 9.0 – 9.5'], [96, 'LVGL 9.6+']];
const ASSET = {};
function asset(path) { if (!ASSET[path]) ASSET[path] = fetch(path).then(r => { if (!r.ok) throw new Error(path); return r.text(); }); return ASSET[path]; }
function confTemplatePath(lv) { return lv == 8 ? 'assets/lv_conf_v8.h' : lv == 96 ? 'assets/lv_conf_v96.h' : 'assets/lv_conf_v9.h'; }
function codeTabs() {
  const tabs = [['c', 'ui.c'], ['h', 'ui.h'], ['conf', 'lv_conf.h'], ['py', 'MicroPython'], ['xml', 'LVGL XML'], ['yaml', 'ESPHome']];
  const pk = E.packOf(S.p.board); if (pk) tabs.push(['pio', 'platformio.ini'], ['main', 'main.cpp']);
  return tabs;
}
async function codeFor(k) {
  const P = S.p, lv = S.lv, pk = E.packOf(P.board);
  if (k == 'c') return {src: E.genC(P, {lvgl: lv}), lang: 'c'};
  if (k == 'h') return {src: E.genH(P), lang: 'c'};
  if (k == 'conf') { const t = await asset(confTemplatePath(lv)); return {src: E.genLvConf(t, P, {memKB: Math.max(64, E.memoryReport(P).lvMemKB)}), lang: 'c', note: 'Only the Montserrat sizes this project uses are switched on, which keeps firmware smaller.'}; }
  if (k == 'py') return {src: E.genPy(P), lang: 'py', note: 'For the LVGL MicroPython binding (lv_micropython, LVGL 9.x).'};
  if (k == 'xml') { const xs = E.genXML(P); return {src: xs.map(x => '<!-- ' + x.name + '.xml -->\n' + x.xml).join('\n'), lang: 'xml', note: xs.skipped.length ? 'LVGL XML has no spinner or LED tag yet, so these are left out: ' + xs.skipped.join(', ') + '.' : 'Loads with the LVGL XML module (LVGL 9.4, LV_USE_XML). Fonts are registered by epixo_xml_init.c in the export.'}; }
  if (k == 'yaml') { const y = E.genYAML(P); return {src: y.yaml, lang: 'yaml', note: y.skipped.length ? 'ESPHome has no chart widget, so these are left out: ' + y.skipped.join(', ') + '.' : 'Merge into your device YAML and set lvgl: displays to your display id.'}; }
  if (k == 'pio') return {src: E.boardPlatformio(P, pk), lang: 'ini', note: pk.kind == 'espanel' ? 'ESP32_Display_Panel ships its LVGL port for LVGL 8, so this project uses the LVGL 8.4 build of your UI.' : null};
  if (k == 'main') return {src: E.mainForPack(P, pk, 'ui'), lang: 'c'};
  return {src: '', lang: 'c'};
}
function hl(src, lang) {
  const re = lang == 'xml' ? /("(?:[^"\\]|\\.)*")|(<\/?[\w:-]+|\/?>)|(\b[\w:-]+(?==))|(\b0x[0-9A-F]+\b|\b\d+\b)/g
    : lang == 'yaml' ? /("(?:[^"\\]|\\.)*")|(^\s*-?\s*[\w.]+(?=:))|(\b0x[0-9A-F]+\b|\b\d+(?:ms|s|deg|%)?\b)|(\b(?:true|false|CENTER|COVER|TRANSP|MOVE_LEFT|MOVE_RIGHT|FADE_IN|LEFT|RIGHT)\b)/gm
    : lang == 'ini' ? /(^\s*;.*$)|(^\[[^\]]+\])|(^[\w.]+(?=\s*=))|(https?:\/\/\S+)/gm
    : /("(?:[^"\\]|\\.)*")|(#\s*\w+|\/\*[\s\S]*?\*\/|\/\/.*$)|(\b(?:void|static|if|else|return|const|NULL|extern|true|false|True|False|None|import|as|for|in|lambda|def|while|char|int|size_t|unsigned|long|uint32_t|uint8_t)\b)|(\b0x[0-9A-Fa-f]+\b|\b\d+\b)|(\b[A-Za-z_]\w*(?=\())|(\bLV_[A-Z0-9_]+\b|\blv\.[A-Z_]+(?:\.[A-Z_0-9]+)*)/gm;
  let o = '', i = 0, m; src = String(src);
  while ((m = re.exec(src))) {
    o += esc(src.slice(i, m.index)); const t = m[0]; let c;
    if (lang == 'xml') c = m[1] ? 'tk-s' : m[2] ? 'tk-t' : m[3] ? 'tk-f' : 'tk-n';
    else if (lang == 'yaml') c = m[1] ? 'tk-s' : m[2] ? 'tk-y' : m[3] ? 'tk-n' : 'tk-k';
    else if (lang == 'ini') c = m[1] ? 'tk-p' : m[2] ? 'tk-k' : m[3] ? 'tk-y' : 'tk-s';
    else c = m[1] ? 'tk-s' : m[2] ? (t.startsWith('/') ? 'tk-p' : 'tk-k') : m[3] ? 'tk-k' : m[4] ? 'tk-n' : m[5] ? 'tk-f' : 'tk-p';
    o += `<span class="${c}">${esc(t)}</span>`; i = m.index + t.length; if (t === '') re.lastIndex++;
  }
  o += esc(src.slice(i));
  return o.split('\n').map(l => `<span class="ln">${l || ' '}</span>`).join('');
}
let codeT;
function queueCode() { if (!S.code) return; clearTimeout(codeT); codeT = setTimeout(renderCode, 150); }
async function renderCode() {
  $('#codePanel').hidden = !S.code; $('#app').classList.toggle('codeopen', S.code); $('#codeBtn').classList.toggle('on', S.code);
  if (!S.code) return;
  const tabs = codeTabs(); if (!tabs.some(t => t[0] == S.ctab)) S.ctab = 'c';
  $('#codeTabs').innerHTML = tabs.map(([k, n]) => `<button class="ctab${S.ctab == k ? ' on' : ''}" data-c="${k}">${n}</button>`).join('') + `<div class="grow"></div><select class="lvsel" id="lvSel" aria-label="LVGL version">${LVT.map(([v, n]) => `<option value="${v}"${S.lv == v ? ' selected' : ''}>${n}</option>`).join('')}</select><button class="tbtn" id="copyCode">${ico(I.dup)}Copy</button><button class="tbtn" id="closeCode" aria-label="Close code">${ico(I.close)}</button>`;
  $('#codeTabs').querySelectorAll('[data-c]').forEach(b => b.onclick = () => { S.ctab = b.dataset.c; renderCode(); });
  $('#lvSel').onchange = e => { S.lv = +e.target.value; S.p.lvgl = S.lv; save(); renderCode(); };
  $('#closeCode').onclick = toggleCode;
  let out;
  try { out = await codeFor(S.ctab); } catch (e) { out = {src: '/* Could not load the lv_conf.h template in this view. It is included in the export. */', lang: 'c'}; }
  const note = $('#codeNote'); note.hidden = !out.note; note.textContent = out.note || '';
  $('#codePre').innerHTML = hl(out.src, out.lang);
  $('#copyCode').onclick = () => copyText(out.src, 'Copied');
}
function copyText(t, msg) {
  const fb = () => { const r = document.createRange(); r.selectNodeContents($('#codePre')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Selected. Press ⌘C to copy'); };
  try { navigator.clipboard.writeText(t).then(() => toast(msg), fb); } catch (e) { fb(); }
}
function toggleCode() { S.code = !S.code; renderCode(); setTimeout(() => S.lastFit && fit(), 10); }

/* ---------------- header & render ---------------- */
function renderHeader() {
  const b = S.p.board; $('#pname').value = S.p.name;
  $('#boardChip').innerHTML = `<span class="dot">${ico(I.chip)}</span><span class="bc"><b>${esc(b.name)}</b><em>${esc(b.brand)} · ${b.w} × ${b.h}${b.round ? ' · round' : ''}</em></span>${ico(I.chev)}`;
  $('#undoBtn').disabled = !S.hist.length; $('#redoBtn').disabled = !S.fut.length;
}
function renderSel() { renderOverlay(); if (S.right == 'design') renderInspector(); if (S.left == 'layers') renderLeft(); }
let docT;
function renderAll() { renderHeader(); renderCanvas(); renderOverlay(); renderLeft(); clearTimeout(docT); DOC = E.doctor(S.p, measure); renderRight(); queueCode(); renderAskMode(); }

/* ---------------- actions ---------------- */
function dup() { const w = selW(); if (!w) return; mutate(() => { const n = Object.assign(JSON.parse(JSON.stringify(w)), {id: 'w' + (++S.p.seq)}); S.p.counts[w.type] = (S.p.counts[w.type] || 0) + 1; n.name = E.uniqueWidgetName(cur(), E.TYPES[w.type].n.replace(/\W/g, '') + S.p.counts[w.type]); n.x = Math.min(w.x + 12, BW() - w.w); n.y = Math.min(w.y + 12, BH() - w.h); cur().widgets.push(n); S.sel = n.id; }); }
function del() { const w = selW(); if (!w) return; mutate(() => { cur().widgets = cur().widgets.filter(x => x.id != w.id); S.sel = null; }); }
function setBoard(b) {
  const o = S.p.board; if (o.id == b.id && o.w == b.w && o.h == b.h) return;
  let toRound = false;
  mutate(() => { toRound = E.adaptToBoard(S.p, b); });
  TH = null; fit(); flashFrame();
  const n = E.doctor(S.p, measure).filter(i => i.sev != 'info').length;
  toast('Layout adapted to ' + b.w + ' × ' + b.h + (toRound ? ' and fitted inside the circle' : '') + (n ? '. Doctor has ' + n + ' suggestions.' : ''));
}
function flashFrame() { const f = $('#frame'); f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash'); }

/* ---------------- modals ---------------- */
function modal(html, onClose) {
  const root = $('#modalRoot'), sc = h(`<div class="scrim">${html}</div>`); root.appendChild(sc);
  let closed = false;
  const close = () => { if (closed) return; closed = true; sc.classList.add('out'); setTimeout(() => sc.remove(), 220); document.removeEventListener('keydown', k); onClose && onClose(); };
  const k = e => { if (e.key == 'Escape') { e.stopPropagation(); close(); } };
  document.addEventListener('keydown', k); sc.addEventListener('pointerdown', e => { if (e.target == sc) close(); }); sc.querySelectorAll('[data-x]').forEach(b => b.onclick = close);
  return {el: sc, close};
}
const xBtn = `<button class="x" data-x aria-label="Close">${ico(I.close)}</button>`;
function confirmSheet(title, body, act, fn) { const m = modal(`<div class="sheet sm"><div class="sheet-h"><div style="flex:1"><h2>${title}</h2><p>${body}</p></div>${xBtn}</div><div style="display:flex;gap:8px;justify-content:flex-end;padding:14px 18px"><button class="btn2" data-x style="width:auto;margin:0;padding:0 16px">Cancel</button><button class="primary" id="cfm" style="background:var(--bad);box-shadow:none">${act}</button></div></div>`); m.el.querySelector('#cfm').onclick = () => { m.close(); fn(); }; }

let brandSel = null, bFilter = 'all', bRot = null;
function openBoards() {
  const brands = [...new Set(E.BOARDS.map(b => b.brand))];
  brandSel = brandSel || S.p.board.brand; if (!brands.includes(brandSel)) brandSel = 'All';
  bRot = S.p.board.rot || 0;
  const filters = [['all', 'All'], ['pack', 'Board pack'], ['verified', 'Verified'], ['round', 'Round'], ['amoled', 'AMOLED'], ['touch', 'Touch']];
  const m = modal(`<div class="sheet" style="height:min(740px,100%)"><div class="sheet-h"><div style="flex:1;min-width:0"><h2>Choose your board</h2><p>${E.BOARDS.length} boards from ${brands.length} makers · ${E.BOARDS.filter(b => b.v != 'spec').length} checked against a primary source</p></div><label class="search" style="margin:0;width:min(240px,36vw)">${ico(I.search)}<input id="bq" placeholder="Search boards or chips" autocomplete="off"></label>${xBtn}</div>
    <div class="sheet-b"><div class="boards"><div class="brands" id="brandList"></div><div class="bgrid">
      <div class="rotrow"><span class="lbl">Orientation</span><div class="radio" id="rotSel"><button data-r="0">Native</button><button data-r="90">Rotated 90°</button></div><div class="grow"></div><div class="bfilter" id="bFilter">${filters.map(([k, n]) => `<button data-f="${k}">${n}</button>`).join('')}</div></div>
      <div class="bcards" id="bcards"></div>
      <div class="custom"><div style="flex:1;min-width:160px"><b>Custom display</b><p class="note" style="margin:2px 0 0">Any resolution, rectangular or round.</p></div><div class="f col"><span class="lbl">Width</span><input class="fld" id="cw" type="number" value="${S.p.board.w}"></div><div class="f col"><span class="lbl">Height</span><input class="fld" id="ch" type="number" value="${S.p.board.h}"></div><div class="f col" style="width:auto"><span class="lbl">Round</span><button class="toggle" id="cr" aria-label="Round"></button></div><button class="primary" id="capply">Use custom</button></div>
      <p class="note"><span class="vchip driver">Driver-verified</span> from ESP32_Display_Panel or esp32-smartdisplay board files · <span class="vchip web">Maker-checked</span> against the maker's page · <span class="vchip spec">Listed spec</span> not yet cross-checked.</p></div></div></div></div>`);
  const draw = () => {
    const q = (m.el.querySelector('#bq').value || '').toLowerCase();
    const ok = b => bFilter == 'all' || (bFilter == 'pack' && b.pack) || (bFilter == 'verified' && b.v != 'spec') || (bFilter == 'round' && b.round) || (bFilter == 'amoled' && b.panel == 'AMOLED') || (bFilter == 'touch' && b.touch);
    const list = E.BOARDS.filter(b => ok(b) && (q ? (b.brand + ' ' + b.name + ' ' + b.chip + ' ' + b.lcd + ' ' + b.w + 'x' + b.h).toLowerCase().includes(q) : brandSel == 'All' || b.brand == brandSel));
    m.el.querySelector('#brandList').innerHTML = ['All', ...brands].map(n => `<button data-b="${esc(n)}" class="${!q && n == brandSel ? 'on' : ''}">${esc(n)}<span>${n == 'All' ? E.BOARDS.filter(ok).length : E.BOARDS.filter(b => b.brand == n && ok(b)).length}</span></button>`).join('');
    m.el.querySelectorAll('#bFilter button').forEach(b => b.classList.toggle('on', b.dataset.f == bFilter));
    m.el.querySelectorAll('#rotSel button').forEach(b => b.classList.toggle('on', +b.dataset.r == bRot));
    m.el.querySelector('#bcards').innerHTML = list.map(b => { const d = E.withRotation(b, bRot), k = 36 / Math.max(d.w, d.h); return `<button class="bcard${b.id == S.p.board.id ? ' on' : ''}" data-id="${b.id}"><span class="bshape"><i style="width:${R(d.w * k)}px;height:${R(d.h * k)}px;border-radius:${b.round ? '50%' : '4px'}"></i></span><span style="min-width:0"><b>${esc(b.name)}</b><small>${esc(b.brand)} · ${b.size} · ${d.w}×${d.h}</small><span class="chips"><span class="vchip ${b.v}" style="padding:2px 6px">${E.VERIFY[b.v].label}</span><span class="chip ${b.panel == 'AMOLED' ? 'amo' : b.panel == 'ePaper' ? 'epd' : ''}">${b.panel}</span>${b.round ? '<span class="chip rnd">Round</span>' : ''}<span class="chip">${esc(b.chip)}</span>${b.pack ? '<span class="chip pack">Board pack</span>' : ''}</span></span></button>`; }).join('') || `<p class="hint">No boards match. Try a chip name like "S3", a size like "800x480", or a custom size below.</p>`;
    m.el.querySelectorAll('[data-b]').forEach(x => x.onclick = () => { brandSel = x.dataset.b; m.el.querySelector('#bq').value = ''; draw(); });
    m.el.querySelectorAll('[data-f]').forEach(x => x.onclick = () => { bFilter = x.dataset.f; draw(); });
    m.el.querySelectorAll('[data-r]').forEach(x => x.onclick = () => { bRot = +x.dataset.r; draw(); });
    m.el.querySelectorAll('.bcard').forEach(x => x.onclick = () => { setBoard(E.withRotation(E.BOARDS.find(b => b.id == x.dataset.id), bRot)); m.close(); });
  };
  draw(); m.el.querySelector('#bq').addEventListener('input', draw);
  const cr = m.el.querySelector('#cr'); cr.classList.toggle('on', !!S.p.board.round); cr.onclick = () => cr.classList.toggle('on');
  m.el.querySelector('#capply').onclick = () => { const w = clamp(+m.el.querySelector('#cw').value || 320, 64, 2048), hh = clamp(+m.el.querySelector('#ch').value || 240, 64, 2048); const r = cr.classList.contains('on'); setBoard({id: `custom-${w}-${hh}-${r ? 'r' : 's'}`, brand: 'Custom', name: `${w}×${hh} display`, size: '—', w, h: hh, round: r, panel: 'Custom', chip: 'Any', touch: true, lcd: '', tp: '', pack: null, v: 'spec', src: '', rot: 0}); m.close(); };
  setTimeout(() => m.el.querySelector('#bq').focus(), 50);
}

/* ---------------- AI ---------------- */
function aiSpec() {
  const b = S.p.board;
  return `Display: ${b.w}x${b.h} px ${b.round ? 'ROUND (circular: keep every widget inside the inscribed circle, about a 16% margin from each edge)' : 'rectangular'}. Coordinates are integers, origin top-left, every widget fully inside the screen.
Style: premium and calm like iOS. Generous spacing, rounded cards (radius 16-28 scaled to the screen), light background like #F2F3F7, white cards, one accent colour, clear hierarchy, large readable text, touch targets at least ${Math.max(32, R(Math.min(b.w, b.h) * 0.09))} px.
Fonts: Montserrat sizes ${E.FONTS.join(',')} only. Text is plain ASCII (no emoji, no degree sign). Draw order matters: cards first, widgets on top.
Widget types and fields (all optional except type,x,y,w,h):
label{text,fg,font,align:"left"|"center"|"right",valign:"top"|"center"|"bottom"}
button{text,bg,fg,font,radius}
switch{checked,accent}
slider{value,min,max,accent}
arc{value,min,max,accent,thick,showValue,fg,font} (a gauge; w equals h)
bar{value,min,max,accent,radius}
checkbox{text,checked,accent,fg,font}
panel{bg,radius,shadow} (a card)
icon{icon: one of ${Object.keys(E.ICONS).join(',')}; fg}
dropdown{options:"A\\nB\\nC",bg,fg,font,radius}
chart{data:"comma separated numbers",accent,bg,radius}
spinner{accent}
led{checked,accent}
Each widget may have "name" (letters and digits). Colours are "#RRGGBB".`;
}
function sanitize(d) {
  const hex = v => /^#[0-9a-f]{6}$/i.test(v || '') ? v.toUpperCase() : null;
  const out = {name: String((d && d.name) || 'AI Screen').replace(/[^A-Za-z0-9 ]/g, '').slice(0, 24) || 'AI Screen', bg: hex(d && d.bg) || E.C.bg, widgets: []};
  for (const w of (Array.isArray(d && d.widgets) ? d.widgets.slice(0, 60) : [])) { const p = E.cleanWidget(S.p.board, w); if (p) out.widgets.push(p); }
  return out;
}
function pickTemplate(t) { t = t.toLowerCase(); const map = [['lock', /lock|keypad|pin|door/], ['thermostat', /thermo|heat|temp|climate|hvac|fan/], ['weather', /weather|forecast|rain|sun/], ['music', /music|player|song|audio|radio/], ['fitness', /fit|ring|step|health|activity|workout/], ['energy', /energy|solar|power|battery|inverter|chart|monitor|sensor|plant|air/], ['settings', /setting|toggle|list|menu|config/]]; for (const [k, r] of map) if (r.test(t)) return k; return 'home'; }
function aiErrHTML(c) { return c == 'signed_out' && window.EPX_HOSTED ? 'Sign in to use AI design. <a href="/login?next=/editor">Sign in</a>' : c == 'no_credits' && window.EPX_HOSTED ? 'You have used all your AI credits. You can still <a href="/connect" target="_blank">design with Claude or ChatGPT</a> for free.' : esc(aiErr(c)); }
function aiErr(c) { return c == 'signed_out' ? 'Sign in to use AI design.' : c == 'no_credits' ? 'You have used all your AI credits.' : c == 'ai_off' ? 'AI is not switched on for this site yet.' : c == 'rate_limited' ? 'Too many requests right now. Try again in a minute.' : c == 'invalid_json' || c == 'empty' ? 'The design came back incomplete. Try again or ask for fewer elements.' : c == 'refused' ? 'That request was declined. Try describing it differently.' : c == 'image_rejected' ? 'That image could not be read. Try a JPEG or PNG under 20 MB.' : c == 'images_unavailable' ? 'Image input is not available in this view.' : 'Something interrupted the request. Try again.'; }
function openAI(startTab) {
  let tab = startTab || 'describe', mode = 'new', ctl = null, img = null;
  const b = S.p.board;
  if (startTab == 'copilot') { $('#askIn').focus(); return; }
  const m = modal(`<div class="sheet md"><div class="sheet-h"><div class="ask" style="width:auto;height:auto;padding:0;box-shadow:none;background:none"><span class="spark">${ico(I.spark)}</span></div><div style="flex:1;min-width:0"><h2>Epixo AI</h2><p>Designs native LVGL screens for ${b.w} × ${b.h}${b.round ? ' round' : ''}. ${window.EPX_HOSTED ? 'Uses your Epixo AI credits.' : 'Uses your AI account.'}</p></div>${xBtn}</div>
    <div style="padding:0 20px 12px"><div class="radio" id="aiTabs"><button data-t="describe">Describe a screen</button><button data-t="sketch">Sketch or photo</button></div></div>
    <div class="ai" id="aiBody"></div></div>`, () => ctl && ctl.abort());
  const body = m.el.querySelector('#aiBody');
  const draw = () => {
    m.el.querySelectorAll('#aiTabs button').forEach(x => x.classList.toggle('on', x.dataset.t == tab));
    if (tab == 'describe') body.innerHTML = `<textarea id="aiq" placeholder="A plant monitor with soil moisture gauge, temperature, light level and a Water now button"></textarea>
      <div class="pchips">${['Smart thermostat with fan modes', 'Bike computer with speed and distance', '3D printer status with progress', 'Air quality monitor with AQI gauge', 'Smart lock keypad'].map(t => `<button class="pchip">${t}</button>`).join('')}</div>
      <div class="airow"><div class="radio" id="aimode"><button data-m="new" class="on">Add as new screen</button><button data-m="replace">Replace current</button></div><div class="grow"></div><button class="btn2" id="aistop" hidden style="width:auto;margin:0">Stop</button><button class="primary" id="aigo">${ico(I.spark)}Generate</button></div><div class="status" id="aist"></div>`;
    else if (tab == 'sketch') body.innerHTML = `<label class="drop" id="drop"><input type="file" id="imgIn" accept="image/png,image/jpeg,image/webp" hidden>${img ? `<img id="imgPrev" alt="">` : ico(I.img)}<div><b>${img ? esc(img.name) : 'Drop a sketch, screenshot or photo'}</b><div class="note" style="margin:2px 0 0">${img ? 'Choose another file to replace it.' : 'Pencil on paper works. Epixo rebuilds it as real widgets.'}</div></div></label>
      <textarea id="aiq" placeholder="Optional: anything the picture does not show, like colours or what each button does" style="min-height:60px"></textarea>
      <div class="airow"><div class="radio" id="aimode"><button data-m="new" class="on">Add as new screen</button><button data-m="replace">Replace current</button></div><div class="grow"></div><button class="btn2" id="aistop" hidden style="width:auto;margin:0">Stop</button><button class="primary" id="aigo">${ico(I.spark)}Build from image</button></div><div class="status" id="aist"></div>`;
    const q = body.querySelector('#aiq'), st = body.querySelector('#aist'), go = body.querySelector('#aigo'), stop = body.querySelector('#aistop');
    body.querySelectorAll('.pchip').forEach(c => c.onclick = () => { q.value = c.textContent; q.focus(); });
    body.querySelectorAll('#aimode button').forEach(x => x.onclick = () => { mode = x.dataset.m; body.querySelectorAll('#aimode button').forEach(y => y.classList.toggle('on', y == x)); });
    stop.onclick = () => ctl && ctl.abort();
    q.addEventListener('keydown', e => { if (e.key == 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); go.click(); } });
    if (tab == 'sketch') {
      const inp = body.querySelector('#imgIn'), drop = body.querySelector('#drop');
      if (img) { const u = URL.createObjectURL(img); body.querySelector('#imgPrev').src = u; }
      inp.onchange = () => { if (inp.files[0]) { img = inp.files[0]; draw(); } };
      drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); }); drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) { img = f; draw(); } });
    }
    setTimeout(() => q.focus(), 30);
    go.onclick = async () => {
      const text = q.value.trim();
      if (tab == 'describe' && !text) { q.focus(); return; }
      if (tab == 'sketch' && !img) { st.textContent = 'Choose an image first.'; return; }
      await capsReady;
      if (!CAP.sample) {
        if (tab == 'describe') { const k = pickTemplate(text); mutate(() => { const ss = E.addTemplate(S.p, k, b.w, b.h, b.round); S.p.cur = ss[0].id; S.sel = null; }); st.textContent = 'AI is not available in this view, so Epixo started from the closest template: ' + E.TPL[k].n + '.'; }
        else st.textContent = 'AI is not available in this view.';
        return;
      }
      ctl = new AbortController(); go.disabled = true; stop.hidden = false;
      try {
        st.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>' + (tab == 'sketch' ? 'Reading your image' : 'Designing your screen');
        const prompt = 'You design embedded touch screen UIs that run on LVGL. Create ONE screen.\n' + aiSpec() + '\n' + (tab == 'sketch' ? 'Rebuild the attached image (a sketch, screenshot or photo of a UI) as this screen. Keep its layout and content, clean it up, and make it look premium. ' + (text ? 'Notes: ' + text.slice(0, 500) : '') : 'Request: "' + text.slice(0, 600) + '"') + '\nReply with only JSON: {"name":"ScreenName","bg":"#RRGGBB","widgets":[{"type":"label","name":"Title","x":24,"y":20,"w":300,"h":40,"text":"Hello","fg":"#0E1525","font":28}]} with 6 to 30 widgets.';
        const opts = {signal: ctl.signal, cache: false, modelTier: 'default'};
        if (tab == 'sketch') opts.images = img;
        const data = await CAP.sample.json(prompt, opts);
        const scr = sanitize(data); if (!scr.widgets.length) throw {code: 'empty'};
        mutate(() => { const ws = scr.widgets.map(([t, p]) => E.mkW(S.p, t, p)).filter(Boolean); ws.forEach(w => { if (w.type == 'label' && !w.valign) w.valign = 'center'; }); const holder = {widgets: []}; ws.forEach(w => { w.name = E.uniqueWidgetName(holder, w.name, w); holder.widgets.push(w); });
          if (mode == 'replace') { const c = cur(); c.widgets = ws; c.bg = scr.bg; } else { const s = E.mkScreen(S.p, scr.name, scr.bg); s.widgets = ws; S.p.cur = s.id; } S.sel = null; });
        const issues = E.doctor(S.p, measure).filter(i => i.screen == S.p.cur && i.sev != 'info').length;
        st.textContent = 'Added “' + cur().name + '” with ' + cur().widgets.length + ' widgets.' + (issues ? ' Design Doctor found ' + issues + ' things to polish.' : '');
        setTimeout(() => m.close(), issues ? 1600 : 900);
      } catch (e) { const c = e && e.code; if (c == 'cancelled') st.textContent = 'Stopped.'; else if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) st.textContent = 'AI was not allowed in this view.'; else st.innerHTML = aiErrHTML(c); }
      finally { go.disabled = false; stop.hidden = true; ctl = null; }
    };
  };
  m.el.querySelectorAll('#aiTabs button').forEach(x => x.onclick = () => { if (ctl) ctl.abort(); tab = x.dataset.t; draw(); });
  draw();
}

/* ---------------- AI bar ---------------- */
const AI = {mode: 'edit', chat: [], ctl: null, open: false};
const askIn = $('#askIn'), askGo = $('#askGo'), askPop = $('#askPop'), askForm = $('#ask');
const SUGGEST = {
  edit: ['Make the title bigger and centre it', 'Switch this screen to a dark theme', 'Add a battery bar under the header', 'Fix everything Design Doctor found'],
  new: ['A thermostat with a big dial and fan modes', 'A bike computer with speed, distance and time', 'A 3D printer status screen with progress', 'An air quality monitor with an AQI gauge']
};
function renderAskMode() {
  $('#askMode').textContent = AI.mode == 'edit' ? 'Edit this screen' : 'New screen';
  askIn.placeholder = AI.mode == 'edit' ? 'Ask AI to change ' + cur().name : 'Describe a new screen for AI to build';
}
function renderAskPop() {
  if (!AI.open) { askPop.hidden = true; return; }
  askPop.hidden = false;
  askPop.innerHTML = `<div class="ah"><b>Epixo AI</b><div class="radio" id="askModes"><button data-m="edit" class="${AI.mode == 'edit' ? 'on' : ''}">Edit this screen</button><button data-m="new" class="${AI.mode == 'new' ? 'on' : ''}">New screen</button></div><button class="x" id="askX" aria-label="Close">${ico(I.close)}</button></div>
    <div class="chat" id="askLog">${AI.chat.map(c => `<div class="msg ${c.cls}">${esc(c.text)}</div>`).join('') || `<div class="msg ai">${AI.mode == 'edit' ? 'Tell me what to change on ' + esc(cur().name) + '. I can move, restyle, add and remove widgets, link screens and fix problems. Every change is one undo step.' : 'Describe the screen you want, and I will build it with real LVGL widgets sized for your ' + esc(S.p.board.name) + '.'}</div>`}</div>
    ${AI.chat.length ? '' : `<div class="sugg">${SUGGEST[AI.mode].map(t => `<button class="pchip">${esc(t)}</button>`).join('')}</div>`}`;
  const log = askPop.querySelector('#askLog'); log.scrollTop = log.scrollHeight;
  askPop.querySelector('#askX').onclick = () => { AI.open = false; renderAskPop(); };
  askPop.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { AI.mode = b.dataset.m; renderAskMode(); renderAskPop(); askIn.focus(); });
  askPop.querySelectorAll('.pchip').forEach(b => b.onclick = () => { askIn.value = b.textContent; askGo.disabled = false; askForm.requestSubmit(); });
}
function aiSay(cls, text) {
  AI.chat.push({cls, text}); if (AI.chat.length > 40) AI.chat.shift();
  if (askPop.hidden) return null;
  const log = askPop.querySelector('#askLog');
  if (AI.chat.length == 1 || !log || askPop.querySelector('.sugg')) { renderAskPop(); return askPop.querySelector('#askLog').lastElementChild; }
  const el = h(`<div class="msg ${cls}">${esc(text)}</div>`);
  // Steps the AI takes go above its reply, which is still being written.
  if (cls == 'tool' && AI.pending && AI.pending.isConnected) { log.insertBefore(el, AI.pending); const c = AI.chat.pop(), i = AI.chat.lastIndexOf(AI.chat.filter(x => x.cls == 'ai').pop()); AI.chat.splice(i < 0 ? AI.chat.length : i, 0, c); }
  else log.appendChild(el);
  log.scrollTop = 1e9;
  return el;
}
askIn.addEventListener('input', () => { askGo.disabled = !askIn.value.trim() && !AI.ctl; });
askIn.addEventListener('focus', () => { if (!AI.open) { AI.open = true; renderAskPop(); } });
askIn.addEventListener('keydown', e => { if (e.key == 'Escape') { e.stopPropagation(); if (AI.ctl) AI.ctl.abort(); else { AI.open = false; renderAskPop(); askIn.blur(); } } });
$('#askMode').onclick = () => { AI.mode = AI.mode == 'edit' ? 'new' : 'edit'; renderAskMode(); if (AI.open) renderAskPop(); askIn.focus(); };
document.addEventListener('pointerdown', e => { if (AI.open && !AI.ctl && !e.target.closest('#askPop,#ask,.scrim,.toast')) { AI.open = false; renderAskPop(); } });
askForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (AI.ctl) { AI.ctl.abort(); return; }
  const text = askIn.value.trim(); if (!text) return;
  AI.open = true; if (!AI.chat.length) renderAskPop();
  aiSay('me', text); askIn.value = '';
  await capsReady;
  if (!CAP.sample) {
    if (document.querySelector('.livepill')) aiSay('ai', 'This editor is linked to your AI app. Ask Claude or ChatGPT there, and every change appears here as it happens.');
    else if (AI.mode == 'new') { const k = pickTemplate(text), b = S.p.board; mutate(() => { const ss = E.addTemplate(S.p, k, b.w, b.h, b.round); S.p.cur = ss[0].id; S.sel = null; }); aiSay('ai', 'AI is not available in this view, so I started you from the closest template: ' + E.TPL[k].n + '. Change anything you like.'); }
    else aiSay('ai', 'AI is not available in this view. On epixo.app, or with Claude or ChatGPT connected through the Epixo MCP server, I can edit this screen for you.');
    return;
  }
  runAgent(text);
});
async function runAgent(text) {
  AI.ctl = new AbortController(); askForm.classList.add('busy'); askGo.disabled = false; askGo.innerHTML = ico(I.stop);
  let pushed = false;
  const tools = E.AI_TOOLS.filter(t => t.name != 'get_code').map(t => ({name: t.name, description: t.description, inputSchema: t.inputSchema, execute: inp => {
    const b0 = S.p.board, before = E.READ_ONLY[t.name] ? null : snap();
    const out = E.runTool(S.p, t.name, inp, measure);
    if (before && snap() != before) {
      if (!pushed) { S.hist.push(before); if (S.hist.length > 150) S.hist.shift(); S.fut = []; pushed = true; }
      fixSel(); boardChanged(b0); if (b0.id != S.p.board.id) { TH = null; fit(); }
      renderAll(); flashFrame(); aiSay('tool', '✓ ' + E.toolNote(t.name, inp));
    }
    return out;
  }}));
  const w = selW();
  const rules = 'You are Epixo AI inside a visual editor for LVGL touch screens on ESP32 displays. Use the tools to do what the maker asks, then reply in one or two short, friendly sentences saying what you did. Never paste JSON or code in the reply.\n' + E.DESIGN_RULES +
    '\nThe board is ' + S.p.board.brand + ' ' + S.p.board.name + ', ' + S.p.board.w + ' x ' + S.p.board.h + (S.p.board.round ? ', round' : '') + '. The open screen is "' + cur().name + '".' + (w ? ' The maker has selected the widget "' + w.name + '"; "this" or "it" usually means that widget.' : '') +
    (AI.mode == 'new' ? '\nThe maker wants a NEW screen: build it in one design_screen call with every widget, then check_design and fix what it finds.' : '\nThe maker wants changes to the open screen: call get_screen first, keep edits minimal and precise, then check_design.');
  const turns = [{role: 'user', content: rules}];
  AI.chat.filter(c => c.cls == 'me' || c.cls == 'ai').slice(-8).forEach(c => turns.push({role: c.cls == 'me' ? 'user' : 'assistant', content: c.text}));
  const bubble = AI.pending = aiSay('ai', '…');
  try {
    const r = await CAP.sample(turns, {signal: AI.ctl.signal, tools, modelTier: 'default', onText: ({text: t}) => { if (bubble) bubble.textContent = t.split('\n\n').pop() || t; }});
    const fin = (r.text.split('\n\n').filter(Boolean).pop() || 'Done.').trim();
    if (bubble) bubble.textContent = fin; AI.chat.filter(c => c.cls == 'ai').pop().text = fin;
  } catch (e) {
    const msg = e && e.code == 'cancelled' ? 'Stopped. Changes so far are kept, and ⌘Z undoes them.' : e && e.code == 'tools_unavailable' ? 'AI cannot edit screens in this view.' : aiErr(e && e.code);
    if (bubble) { bubble.textContent = msg; if (window.EPX_HOSTED && (e && (e.code == 'signed_out' || e.code == 'no_credits'))) bubble.innerHTML = aiErrHTML(e.code); }
    AI.chat.filter(c => c.cls == 'ai').pop().text = msg;
  } finally {
    if (pushed) save();
    AI.ctl = null; AI.pending = null; askForm.classList.remove('busy'); askGo.innerHTML = ico(I.send); askGo.disabled = !askIn.value.trim(); renderHeader();
  }
}

/* ---------------- export ---------------- */
async function renderPNG(scr) {
  const th = await thumbEngine(); if (!th) return null;
  const b = S.p.board; if (th.w != b.w || th.h != b.h) th.init(b.w, b.h);
  th.exec('X\n' + E.scriptScreen(S.p, scr) + '\nL\t' + E.sid(scr.id) + '\n');
  const cv = document.createElement('canvas'); cv.width = b.w; cv.height = b.h; th.img = null; th.renderTo(cv.getContext('2d'), 500);
  return new Promise(r => cv.toBlob(r, 'image/png'));
}
async function saveFile(filename, data, st) {
  await capsReady;
  if (!CAP.downloads && !window.epixoHost) {
    const blob = data instanceof Blob ? data : new Blob([data]), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); if (st) st.textContent = 'Saved ' + filename + '.'; return true;
  }
  if (!CAP.downloads) { if (st) st.textContent = 'Downloads are not available in this view. Copy files from the Code panel instead.'; return false; }
  try { await CAP.downloads.save({filename, data}); if (st) st.textContent = 'Saved ' + filename + '.'; return true; }
  catch (e) { if (st) st.textContent = e && e.code == 'declined' ? 'Download cancelled.' : e && e.code == 'extension_not_enabled' ? 'Zip downloads are switched off here. Save the project file, or copy files from the Code panel.' : e && e.code == 'too_large' ? 'That file is too large for this view.' : 'The download did not go through. Try again.'; return false; }
}
const README = (P, parts) => `# ${P.name}

Made with Epixo Editor for **${P.board.brand} ${P.board.name}** (${P.board.w} × ${P.board.h}${P.board.round ? ', round' : ''}).

${parts.map(p => '- ' + p).join('\n')}

## Using the LVGL C files
1. Copy \`ui/\` into your project (Arduino: next to your .ino; PlatformIO: into \`src/\`).
2. Use the included \`lv_conf.h\` or switch on the same Montserrat sizes in yours.
3. Call \`ui_init()\` once your display and touch drivers run. \`ui_get_screen(i)\` returns screen *i*.

${E.actionGuide(P)}
## Verified by Epixo
The generator behind this export was checked on every template and a test project with every widget:
- C output compiles with \`-Wall -Wextra -Werror\` and renders pixel-identical to the editor on LVGL 8.4, 9.2, 9.4 and 9.6.
- LVGL XML loads in LVGL 9.4's XML engine and renders pixel-identical.
- ESPHome YAML passes \`esphome config\` (ESPHome 2026.9.1).
- MicroPython runs on lv_micropython (LVGL 9.3) and matches pixel for pixel, except the spinner, which the binding does not expose and Epixo draws as an arc.
Board packs follow the official driver library examples but were not compiled for ESP32 by Epixo. Test once on your board.
`;
async function buildZip(sel, st) {
  if (!window.JSZip) throw new Error('zip tool did not load');
  const P = S.p, z = new JSZip(), lv = S.lv, pk = E.packOf(P.board), parts = [];
  const confT = async v => E.genLvConf(await asset(confTemplatePath(v)), P, {memKB: Math.max(64, E.memoryReport(P).lvMemKB)});
  if (sel.c) { z.file('ui/ui.c', E.genC(P, {lvgl: lv})); z.file('ui/ui.h', E.genH(P)); try { z.file('ui/lv_conf.h', await confT(lv)); } catch (e) {} parts.push('`ui/` LVGL C for ' + LVT.find(x => x[0] == lv)[1]); }
  if (sel.pack && pk) {
    const dir = 'platformio/';
    z.file(dir + 'platformio.ini', E.boardPlatformio(P, pk));
    if (pk.kind == 'espanel') {
      z.file(dir + 'src/main.cpp', E.mainForPack(P, pk, 'ui')); z.file(dir + 'src/ui.c', E.genC(P, {lvgl: 8})); z.file(dir + 'src/ui.h', E.genH(P));
      for (const f of ['lvgl_v8_port.cpp', 'lvgl_v8_port.h', 'esp_panel_board_custom_conf.h', 'esp_panel_drivers_conf.h', 'esp_utils_conf.h']) z.file(dir + 'src/' + f, await asset('packs/espanel/' + f));
      z.file(dir + 'src/lv_conf.h', E.genLvConf(await asset('packs/espanel/lv_conf.h'), P, {}));
      if (P.board.chip != 'ESP32') z.file(dir + 'boards/' + pk.id + '.json', await asset('packs/espanel/boards/' + boardJsonFor(P.board) + '.json'));
      const ino = 'arduino/' + E.ident(P.name).toLowerCase() + '/';
      z.file(ino + E.ident(P.name).toLowerCase() + '.ino', E.mainForPack(P, pk, 'ui'));
      z.file(ino + 'ui.c', E.genC(P, {lvgl: 8})); z.file(ino + 'ui.h', E.genH(P));
      for (const f of ['lvgl_v8_port.cpp', 'lvgl_v8_port.h', 'esp_panel_board_custom_conf.h', 'esp_panel_drivers_conf.h', 'esp_utils_conf.h']) z.file(ino + f, await asset('packs/espanel/' + f));
      z.file(ino + 'esp_panel_board_supported_conf.h', (await asset('packs/espanel/esp_panel_board_supported_conf.h')).replace(/#define ESP_PANEL_BOARD_DEFAULT_USE_SUPPORTED\s+\(0\)/, '#define ESP_PANEL_BOARD_DEFAULT_USE_SUPPORTED   (1)').replace(new RegExp('^// #define ' + pk.id + '\\s*$', 'm'), '#define ' + pk.id));
      z.file(ino + 'lv_conf.h', E.genLvConf(await asset('packs/espanel/lv_conf.h'), P, {}).replace(/\/\/ #define LV_COLOR_16_SWAP \d/, '#define LV_COLOR_16_SWAP ' + (P.board.bus == 'spi' ? 1 : 0)));
      parts.push('`platformio/` and `arduino/` ready projects using Espressif ESP32_Display_Panel + LVGL 8.4');
    } else {
      z.file(dir + 'src/main.cpp', E.mainForPack(P, pk, 'ui')); z.file(dir + 'src/ui.c', E.genC(P, {lvgl: 9})); z.file(dir + 'src/ui.h', E.genH(P));
      z.file(dir + 'include/lv_conf.h', await confT(9));
      z.file(dir + 'boards/README.md', 'Clone the board definitions here:\n\n    git clone https://github.com/rzeldent/platformio-espressif32-sunton.git .\n');
      parts.push('`platformio/` ready project using esp32-smartdisplay + LVGL 9');
    }
  }
  if (sel.runtime) {
    const dir = 'live-mirror/';
    z.file(dir + 'src/epixo_rt.c', await asset('runtime/epixo_rt.c')); z.file(dir + 'src/epixo_rt.h', await asset('runtime/epixo_rt.h'));
    if (pk) {
      z.file(dir + 'platformio.ini', E.boardPlatformio(P, pk)); z.file(dir + 'src/main.cpp', E.mainForPack(P, pk, 'runtime'));
      const allFonts = Object.assign({}, P, {screens: [{widgets: E.FONTS.map(f => ({type: 'label', font: f}))}]});
      if (pk.kind == 'espanel') { for (const f of ['lvgl_v8_port.cpp', 'lvgl_v8_port.h', 'esp_panel_board_custom_conf.h', 'esp_panel_drivers_conf.h', 'esp_utils_conf.h']) z.file(dir + 'src/' + f, await asset('packs/espanel/' + f)); z.file(dir + 'src/lv_conf.h', E.genLvConf(await asset('packs/espanel/lv_conf.h'), allFonts, {memKB: 256})); if (P.board.chip != 'ESP32') z.file(dir + 'boards/' + pk.id + '.json', await asset('packs/espanel/boards/' + boardJsonFor(P.board) + '.json')); }
      else { z.file(dir + 'include/lv_conf.h', E.genLvConf(await asset('assets/lv_conf_v9.h'), allFonts, {memKB: 256})); z.file(dir + 'boards/README.md', 'Clone https://github.com/rzeldent/platformio-espressif32-sunton.git into this folder.\n'); }
      parts.push('`live-mirror/` Epixo runtime firmware for Live Mirror');
    } else parts.push('`live-mirror/src/` Epixo runtime source (add your display driver)');
  }
  if (sel.py) { z.file('micropython/ui.py', E.genPy(P)); parts.push('`micropython/ui.py` for lv_micropython'); }
  if (sel.xml) { const xs = E.genXML(P); xs.forEach(x => z.file('xml/' + x.name + '.xml', x.xml)); z.file('xml/epixo_xml_init.c', E.genXMLLoader(P)); parts.push('`xml/` LVGL XML screens' + (xs.skipped.length ? ' (without ' + xs.skipped.join(', ') + ')' : '')); }
  if (sel.yaml) { const y = E.genYAML(P); z.file('esphome/epixo_ui.yaml', y.yaml); parts.push('`esphome/epixo_ui.yaml`' + (y.skipped.length ? ' (charts left out)' : '')); }
  if (sel.png) { for (let i = 0; i < P.screens.length; i++) { if (st) st.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>Rendering ' + P.screens[i].name; const b = await renderPNG(P.screens[i]); if (b) z.file('screens/' + (i + 1) + '-' + E.ident(P.screens[i].name).toLowerCase() + '.png', b); } parts.push('`screens/` PNG renders straight from LVGL'); }
  if (sel.json) { z.file('project.epixo.json', JSON.stringify(P, null, 2)); parts.push('`project.epixo.json` to reopen in Epixo'); }
  z.file('README.md', README(P, parts));
  return z.generateAsync({type: 'blob'});
}
function boardJsonFor(b) { return b.chip == 'ESP32-P4' ? 'BOARD_ESPRESSIF_ESP32_P4_FUNCTION_EV_BOARD' : b.chip == 'ESP32-C3' ? 'BOARD_ESPRESSIF_ESP32_C3_LCDKIT' : b.chip == 'ESP32' ? 'BOARD_M5STACK_M5CORE2' : 'BOARD_ESPRESSIF_ESP32_S3_LCD_EV_BOARD_2_V1_5'; }
function openExport(preset) {
  const P = S.p, pk = E.packOf(P.board), nW = P.screens.reduce((a, s) => a + s.widgets.length, 0), er = DOC.filter(i => i.sev == 'error').length;
  const opts = [
    ['c', 'C', 'LVGL C · ui.c, ui.h, lv_conf.h', 'Arduino IDE, PlatformIO, ESP-IDF, any MCU', 'Pixel-verified', '#E6EFFF', '#0A5AE0', true],
    ['pack', 'PIO', 'Board pack project', pk ? (pk.kind == 'espanel' ? 'ESP32_Display_Panel for ' + P.board.name + ' · PlatformIO and Arduino IDE' : 'esp32-smartdisplay for ' + P.board.name) : 'Not available for this board yet', pk ? 'Official driver' : 'Unavailable', '#E5F7EA', '#1C8C3F', !!pk],
    ['runtime', '⚡', 'Live Mirror firmware', pk ? 'Flash once, then stream edits over USB' : 'Runtime source only for this board', 'Same code as the editor', '#FFF4E0', '#C26A00', true],
    ['py', 'PY', 'MicroPython', 'For lv_micropython (LVGL 9)', 'Ran on LVGL 9.3', '#E8F7EE', '#1C8C3F', true],
    ['xml', 'XML', 'LVGL XML', 'LVGL 9.4+ XML module, with a font loader', 'Pixel-verified', '#F4EAFE', '#7C3AED', true],
    ['yaml', 'YML', 'ESPHome', 'lvgl: block for Home Assistant devices', 'esphome config passes', '#FFF1DE', '#C26A00', true],
    ['png', 'PNG', 'Screen images', 'Rendered by LVGL, ready for README and videos', 'From the engine', '#EEF0F4', '#566075', engineState == 'on'],
    ['json', '{}', 'Project file', 'Reopen this project in Epixo later', '', '#EEF0F4', '#566075', true]
  ];
  const sel = {c: 1, pack: !!pk, runtime: false, py: 1, xml: 1, yaml: 1, png: engineState == 'on', json: 1};
  if (preset) { Object.keys(sel).forEach(k => sel[k] = 0); preset.forEach(k => sel[k] = 1); sel.json = 1; }
  const m = modal(`<div class="sheet md"><div class="sheet-h"><div style="flex:1;min-width:0"><h2>Export</h2><p>${esc(P.board.brand)} ${esc(P.board.name)} · ${P.board.w} × ${P.board.h} · LVGL target <b>${LVT.find(x => x[0] == S.lv)[1]}</b></p></div>${xBtn}</div>
    <div class="sheet-b"><div class="ex"><div class="exsum"><div><b>${P.screens.length}</b><span>Screens</span></div><div><b>${nW}</b><span>Widgets</span></div><div><b>${E.usedFonts(P).length}</b><span>Font sizes</span></div><div><b style="color:${er ? 'var(--bad)' : 'var(--ok)'}">${er ? er : '✓'}</b><span>${er ? 'Doctor errors' : 'Doctor clean'}</span></div></div>
    <div class="opts">${opts.map(o => `<label class="opt${sel[o[0]] ? ' on' : ''}"${o[7] ? '' : ' style="opacity:.5;pointer-events:none"'}><input type="checkbox" data-o="${o[0]}"${sel[o[0]] ? ' checked' : ''}${o[7] ? '' : ' disabled'}><span class="fi" style="background:${o[5]};color:${o[6]}">${o[1]}</span><span class="grow"><b>${o[2]}</b><small>${o[3]}</small></span>${o[4] ? `<span class="vtag${o[4] == 'Official driver' || o[4] == 'Same code as the editor' || o[4] == 'From the engine' ? ' info' : o[4] == 'Unavailable' ? ' warn' : ''}">${o[4]}</span>` : ''}</label>`).join('')}</div>
    <div class="exbtns"><button class="primary" id="exZip">${ico(I.dl)}Download .zip</button><button class="btn2" id="exJson">Project file only</button><label class="btn2" style="width:auto;margin:0;padding:0 14px;cursor:pointer">Open project file<input type="file" id="exOpen" accept=".json,application/json" hidden></label><button class="btn2" id="verRep">What is verified?</button></div>
    <div class="status" id="exst"></div></div></div></div>`);
  const st = m.el.querySelector('#exst');
  m.el.querySelectorAll('[data-o]').forEach(c => c.onchange = () => { sel[c.dataset.o] = c.checked ? 1 : 0; c.closest('.opt').classList.toggle('on', c.checked); });
  m.el.querySelector('#exZip').onclick = async () => { st.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>Building files'; try { const blob = await buildZip(sel, st); await saveFile((E.ident(P.name).toLowerCase() || 'epixo') + '-epixo.zip', blob, st); } catch (e) { st.textContent = 'Could not build the zip here (' + (e && e.message || e) + '). Use the Code panel to copy files.'; } };
  m.el.querySelector('#exJson').onclick = () => saveFile((E.ident(P.name).toLowerCase() || 'epixo') + '.epixo.json', JSON.stringify(P, null, 2), st);
  m.el.querySelector('#verRep').onclick = () => { m.close(); openVerify(); };
  m.el.querySelector('#exOpen').onchange = e => openProjectFile(e.target.files[0], st, m);
}
function openProjectFile(f, st, m) {
  if (!f) return; const r = new FileReader();
  r.onload = () => { try { const p = migrate(JSON.parse(r.result)); if (!p) throw 0; p.pid = newPid(); const b = S.p.board; push(); S.p = p; S.sel = null; fixSel(); boardChanged(b); if (ENG) { ENG.synced.clear(); syncAll(); } save(); renderAll(); fit(); m && m.close(); toast('Opened ' + (p.name || 'project')); } catch (x) { if (st) st.textContent = 'That file is not an Epixo project.'; } };
  r.readAsText(f);
}

function openVerify() {
  const rows = [['C (LVGL 8.4)', '57 projects', 'Compiled -Werror, pixel-identical'], ['C (LVGL 9.2)', '57 projects', 'Compiled -Werror, pixel-identical'], ['C (LVGL 9.4)', '57 projects', 'Compiled -Werror, pixel-identical'], ['C (LVGL 9.6)', '57 projects', 'Compiled -Werror, pixel-identical'], ['LVGL XML (9.4)', '57 projects', 'Loaded by LVGL, pixel-identical'], ['ESPHome YAML', '57 configs', 'esphome config 2026.9.1 passes'], ['MicroPython', '57 projects', 'Ran on lv_micropython 9.3 · 56 pixel-identical, spinner shown as an arc'], ['Text measuring', '133 strings', 'Within 3.4% of LVGL, exact with engine']];
  modal(`<div class="sheet md"><div class="sheet-h"><div style="flex:1"><h2>What Epixo verifies</h2><p>Every export format was tested against real LVGL, not just generated.</p></div>${xBtn}</div><div class="sheet-b"><div class="road">
    <div class="road-i"><div class="ti">${ico(I.bolt)}</div><div><b>The editor canvas is LVGL</b><small>LVGL 9.2 compiled to WebAssembly draws the canvas, the thumbnails, the screenshots and the preview. The same runtime C code powers Live Mirror on your board.</small></div></div>
    <div style="overflow-x:auto"><table class="vt"><thead><tr><th>Output</th><th>Tested on</th><th>Result</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="ok">${r[2]}</td></tr>`).join('')}</tbody></table></div>
    <p class="note">“Pixel-identical” means the exported code, built with the real LVGL library, produced the exact same frame as the editor, byte for byte, for 9 templates on 7 boards plus a test project with every widget and option.</p>
    <div class="road-i"><div class="ti">${ico(I.chip)}</div><div><b>Still to test on hardware</b><small>Board pack and Live Mirror projects follow the official ESP32_Display_Panel and esp32-smartdisplay examples, but Epixo could not compile them for ESP32 in its build environment. Flash one board before you rely on them.</small></div><span class="tag plan">Next</span></div>
    <div class="road-i"><div class="ti">${ico(I.screen)}</div><div><b>Boards</b><small>${E.BOARDS.filter(b => b.v == 'driver' || b.v == 'cyd').length} boards use resolutions from driver board files, ${E.BOARDS.filter(b => b.v == 'web').length} were checked against maker pages, and ${E.BOARDS.filter(b => b.v == 'spec').length} are listed specs marked for checking.</small></div></div>
  </div></div></div>`);
}

/* ---------------- projects ---------------- */
async function openProjects() {
  await capsReady;
  const cloud = CAP.db && CAP.uid;
  const m = modal(`<div class="sheet sm"><div class="sheet-h"><div style="flex:1;min-width:0"><h2>Projects</h2><p>${cloud ? 'Saved privately to your account. Nobody else can see them.' : 'Cloud saving is not available in this view, so projects live in this browser.'}</p></div>${xBtn}</div>
    <div class="sheet-b" style="padding:14px 18px 18px"><div class="rows" id="plist"><p class="hint">Loading…</p></div>
    <div class="exbtns" style="margin-top:12px"><button class="primary" id="pNew">${ico(I.plus)}New project</button><label class="btn2" style="width:auto;margin:0;padding:0 14px;cursor:pointer">Open file<input type="file" id="pOpen" accept=".json,application/json" hidden></label>${cloud ? `<button class="btn2" id="pSave">${ico(I.cloud)}Save now</button>` : ''}</div><div class="status" id="pst"></div></div></div>`);
  const list = m.el.querySelector('#plist'), st = m.el.querySelector('#pst');
  const draw = async () => {
    let docs = [];
    if (cloud) { try { const snap = await CAP.db.collection('data/users/' + CAP.uid).orderBy('updated', 'desc').limit(100).get(); docs = snap.docs.map(d => Object.assign({pid: d.id}, d.data())).filter(d => d.kind == 'epixo-project'); } catch (e) { st.textContent = 'Could not read your saved projects right now.'; } }
    if (!docs.some(d => d.pid == S.p.pid)) docs.unshift({pid: S.p.pid, name: S.p.name, board: S.p.board.brand + ' ' + S.p.board.name, screens: S.p.screens.length, updated: S.p.updated, local: true});
    list.innerHTML = docs.map(d => `<div class="row${d.pid == S.p.pid ? ' sel' : ''}" data-pid="${d.pid}" style="height:auto;padding:8px 8px 8px 12px">${ico(I.screen)}<span class="nm" style="white-space:normal"><b style="display:block">${esc(d.name)}</b><small style="opacity:.75">${esc(d.board || '')} · ${d.screens || 0} screens · ${d.updated ? new Date(d.updated).toLocaleString() : ''}${d.local ? ' · this browser' : ''}</small></span>${d.pid != S.p.pid && cloud ? `<button class="rb lit" data-del="${d.pid}" title="Delete">${ico(I.trash)}</button>` : ''}</div>`).join('');
    list.querySelectorAll('[data-pid]').forEach(r => r.addEventListener('click', async e => {
      const delId = e.target.closest('[data-del]') && e.target.closest('[data-del]').dataset.del;
      if (delId) { e.stopPropagation(); confirmSheet('Delete this project?', 'It is removed from your account and cannot be undone.', 'Delete', async () => { try { await projectRef(delId).delete(); draw(); } catch (x) { st.textContent = 'Could not delete it right now.'; } }); return; }
      const pid = r.dataset.pid; if (pid == S.p.pid) { m.close(); return; }
      try { const d = await projectRef(pid).get(); const p = migrate(JSON.parse(d.data().json)); if (!p) throw 0; await cloudSave(); const b = S.p.board; S.hist = []; S.fut = []; S.p = p; S.sel = null; fixSel(); boardChanged(b); if (ENG) { ENG.synced.clear(); syncAll(); } TH = null; save(); renderAll(); fit(); m.close(); toast('Opened ' + p.name); } catch (x) { st.textContent = 'That project could not be opened.'; }
    }));
  };
  draw();
  m.el.querySelector('#pNew').onclick = async () => { if (cloud) await cloudSave(); m.close(); setTimeout(() => openWelcome(true), 240); };
  m.el.querySelector('#pOpen').onchange = e => openProjectFile(e.target.files[0], st, m);
  const ps = m.el.querySelector('#pSave'); if (ps) ps.onclick = async () => { await cloudSave(); st.textContent = cloudOk === true ? 'Saved to your account.' : 'Cloud save did not work. Your project is still saved in this browser.'; draw(); };
}

function openPalette() {
  const cmds = [
    ...Object.entries(E.TYPES).map(([k, v]) => ({n: 'Add ' + v.n, g: 'Widget', run: () => addWidget(k)})),
    ...S.p.screens.map(s => ({n: 'Go to ' + s.name, g: 'Screen', run: () => goScreen(s.id)})),
    ...Object.entries(E.TPL).map(([k, v]) => ({n: 'Template: ' + v.n, g: 'Template', run: () => { const b = S.p.board; mutate(() => { const ss = E.addTemplate(S.p, k, b.w, b.h, b.round); S.p.cur = ss[0].id; S.sel = null; }); }})),
    ...E.THEMES.map(t => ({n: 'Theme: ' + t.n, g: 'Style', run: () => applyTheme(t)})),
    {n: 'Choose board', g: 'Project', run: openBoards}, {n: 'Projects', g: 'Project', run: openProjects}, {n: 'Export', g: 'Project', run: () => openExport()},
    {n: 'Ask AI to design a screen', g: 'AI', run: () => { AI.mode = 'new'; renderAskMode(); askIn.focus(); }}, {n: 'Build a screen from a sketch or photo', g: 'AI', run: () => openAI('sketch')}, {n: 'Ask AI to change this screen', g: 'AI', run: () => { AI.mode = 'edit'; renderAskMode(); askIn.focus(); }},
    {n: 'Appearance: light', g: 'View', run: () => setTheme('light')}, {n: 'Appearance: dark', g: 'View', run: () => setTheme('dark')}, {n: 'Appearance: automatic', g: 'View', run: () => setTheme('auto')}, {n: 'Focus mode', g: 'View', run: toggleFocus},
    {n: 'Start a new project', g: 'Project', run: () => openWelcome(true)}, {n: 'Show the welcome tour', g: 'Help', run: () => openWelcome(false)},
    {n: 'Design Doctor', g: 'View', run: () => { S.right = 'doctor'; renderRight(); renderOverlay(); }}, {n: 'Fix all Doctor issues', g: 'Edit', run: () => { S.right = 'doctor'; renderRight(); const b = $('#fixAll'); if (b) b.click(); }},
    {n: 'Live Mirror', g: 'Device', run: () => { S.right = 'device'; renderRight(); }},
    {n: S.code ? 'Hide code' : 'Show code', g: 'View', run: toggleCode}, {n: S.mode == 'preview' ? 'Stop preview' : 'Preview on LVGL', g: 'View', run: () => setMode(S.mode == 'preview' ? 'design' : 'preview')},
    {n: 'Fit to view', g: 'View', run: fit}, {n: 'Save screenshot', g: 'View', run: screenshot}, {n: 'New screen', g: 'Screen', run: () => mutate(() => { const s = E.mkScreen(S.p, 'Screen', cur().bg); S.p.cur = s.id; S.sel = null; })},
    {n: 'Undo', g: 'Edit', run: undo}, {n: 'Redo', g: 'Edit', run: redo}, {n: 'What is verified', g: 'Help', run: openVerify}];
  let idx = 0, list = cmds;
  const m = modal(`<div class="sheet pal"><label class="search">${ico(I.search)}<input id="pq" placeholder="Type a command, widget, screen or theme" autocomplete="off"></label><ul id="pl"></ul></div>`);
  const inp = m.el.querySelector('#pq'), ul = m.el.querySelector('#pl');
  const draw = () => { const q = inp.value.toLowerCase().trim(); list = cmds.filter(c => !q || q.split(/\s+/).every(p => (c.n + ' ' + c.g).toLowerCase().includes(p))); idx = clamp(idx, 0, Math.max(0, list.length - 1));
    ul.innerHTML = list.map((c, i) => `<li class="${i == idx ? 'on' : ''}" data-i="${i}"><b>${esc(c.n)}</b><span>${c.g}</span></li>`).join('') || '<li><span>No matches</span></li>';
    ul.querySelectorAll('[data-i]').forEach(li => li.onclick = () => { idx = +li.dataset.i; run(); }); const on = ul.querySelector('.on'); on && on.scrollIntoView({block: 'nearest'}); };
  const run = () => { const c = list[idx]; if (!c) return; m.close(); setTimeout(c.run, 10); };
  inp.addEventListener('input', () => { idx = 0; draw(); });
  inp.addEventListener('keydown', e => { if (e.key == 'ArrowDown') { idx++; draw(); e.preventDefault(); } if (e.key == 'ArrowUp') { idx--; draw(); e.preventDefault(); } if (e.key == 'Enter') run(); });
  draw(); setTimeout(() => inp.focus(), 30);
}
async function screenshot() {
  if (engineState != 'on') { toast('Screenshots need the LVGL engine.'); return; }
  const b = await renderPNG(cur()); if (!b) return;
  const ok = await saveFile(E.ident(cur().name).toLowerCase() + '.png', b, null);
  if (ok) toast('Saved ' + cur().name + ' as PNG');
}
let toastT;
function toast(t) { document.querySelectorAll('.toast').forEach(x => x.remove()); const el = h(`<div class="toast" role="status">${esc(t)}</div>`); document.body.appendChild(el); clearTimeout(toastT); toastT = setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2600); }

/* ---------------- welcome for first-time makers ---------------- */
const POPULAR = [['sunton-cyd-esp32-2432s028r', 'The Cheap Yellow Display. A great first board.'], ['waveshare-esp32-s3-touch-lcd-4-3', 'A roomy 4.3 inch touch panel.'], ['waveshare-esp32-s3-touch-amoled-1-75', 'A bright round AMOLED, like a watch.'], ['m5stack-core2', 'A finished device in a case.'], ['elecrow-crowpanel-7-0-hmi', 'A big 7 inch control panel.'], ['lilygo-t-display-s3', 'A small, tall stick display.']];
const seenWelcome = () => { try { return !!localStorage.getItem('epixo.welcomed'); } catch (e) { return true; } };
const markWelcome = () => { try { localStorage.setItem('epixo.welcomed', '1'); } catch (e) {} };
function boardShape(b, k) { const s = (k || 40) / Math.max(b.w, b.h); return `<span class="bshape"><i style="width:${R(b.w * s)}px;height:${R(b.h * s)}px;border-radius:${b.round ? '50%' : '5px'}"></i></span>`; }
function openWelcome(newProject) {
  let step = 0, board = S.p.board;
  const m = modal(`<div class="sheet welcome"><div class="wh"></div><div class="wb sheet-b"></div><div class="wf"></div></div>`, () => { markWelcome(); });
  const wh = m.el.querySelector('.wh'), wb = m.el.querySelector('.wb'), wf = m.el.querySelector('.wf');
  const start = (key, prompt) => {
    m.close();
    const b0 = S.p.board, p = E.blank(board); p.pid = newPid();
    if (key) { p.name = E.TPL[key].n; p.cur = E.addTemplate(p, key, board.w, board.h, board.round)[0].id; } else { p.name = 'My first screen'; p.cur = E.mkScreen(p, 'Home').id; }
    if (S.p.screens.some(s => s.widgets.length)) cloudSave();
    S.hist = []; S.fut = []; S.p = p; S.sel = null; boardChanged(b0); if (ENG) { ENG.synced.clear(); syncAll(); } TH = null; save(); renderAll(); requestAnimationFrame(() => { fit(); flashFrame(); });
    if (prompt) { AI.mode = 'new'; renderAskMode(); askIn.value = prompt; askGo.disabled = false; askForm.requestSubmit(); }
    else if (!newProject) setTimeout(() => coach(0), 700);
  };
  const draw = () => {
    if (step == 0) {
      wh.innerHTML = `<img class="ico" src="assets/epixo-mark.png" alt=""><h2>${newProject ? 'Start a new project' : 'Welcome to Epixo'}</h2><p>Design touch screens for ESP32 displays. What you see here is drawn by real LVGL, so it looks the same on your board. First, which display are you using?</p>`;
      wb.innerHTML = `<div class="choices">${POPULAR.map(([id, d]) => { const b = E.BOARDS.find(x => x.id == id); return b ? `<button class="choice${board.id == id ? ' on' : ''}" data-b="${id}">${boardShape(b)}<b>${esc(b.name)}</b><small>${esc(b.brand)} · ${b.size} · ${d}</small></button>` : ''; }).join('')}</div>`;
      wf.innerHTML = `<div class="stepdots"><i class="on"></i><i></i></div><button class="btn2" id="wOther" style="width:auto;margin:0">Find my board</button><button class="primary" id="wNext">Continue</button>`;
      wb.querySelectorAll('[data-b]').forEach(x => x.onclick = () => { board = E.withRotation(E.BOARDS.find(b => b.id == x.dataset.b), 0); step = 1; draw(); });
      wf.querySelector('#wOther').onclick = () => { m.close(); openBoards(); };
      wf.querySelector('#wNext').onclick = () => { step = 1; draw(); };
    } else {
      wh.innerHTML = `<h2>How would you like to start?</h2><p>Pick an idea to make your own, describe the screen to AI, or begin with a blank screen on your ${esc(board.name)}.</p>`;
      wb.innerHTML = `<form class="ask" id="wAsk" style="width:100%;margin:0 0 14px;background:var(--fill);box-shadow:none"><span class="spark">${ico(I.spark)}</span><input id="wQ" placeholder="Describe your screen, like “a plant monitor with soil moisture”"><button class="send" aria-label="Build with AI">${ico(I.send)}</button></form>
        <div class="choices"><button class="choice" data-k=""><div class="mini" style="aspect-ratio:16/10;display:grid;place-items:center;color:var(--ink3)">${ico(I.plus)}</div><b>Blank screen</b><small>Start from nothing</small></button>${Object.entries(E.TPL).map(([k, v]) => `<button class="choice" data-k="${k}"><div class="mini" data-w="${k}"></div><b>${v.n}</b><small>${v.d}</small></button>`).join('')}</div>`;
      wf.innerHTML = `<div class="stepdots"><i></i><i class="on"></i></div><button class="btn2" id="wBack" style="width:auto;margin:0">Back</button>`;
      const jobs = [];
      wb.querySelectorAll('[data-w]').forEach(el => { const prev = S.p.board; S.p.board = board; const [tmp, scr] = templatePreview(el.dataset.w, board); jobs.push([miniCanvas(el), tmp, scr]); S.p.board = prev; });
      const prev = S.p.board; S.p.board = board; paintThumbs(jobs).finally(() => { S.p.board = prev; }); S.p.board = prev;
      wb.querySelectorAll('[data-k]').forEach(x => x.onclick = () => start(x.dataset.k || null));
      wb.querySelector('#wAsk').onsubmit = e => { e.preventDefault(); const q = wb.querySelector('#wQ').value.trim(); if (q) start(null, q); else wb.querySelector('#wQ').focus(); };
      wf.querySelector('#wBack').onclick = () => { step = 0; draw(); };
    }
  };
  draw();
}
const TIPS = [
  ['#leftPanel', 'Add widgets', 'Drag a widget onto the screen, or tap it to drop it in the middle. Double-click any text to edit it.', 'right'],
  ['#ask', 'Ask AI', 'Describe a change in plain words, like “make the buttons bigger”. AI edits the screen while you watch, and ⌘Z undoes it.', 'up'],
  ['#playBtn', 'Try it', 'Tap through your screens on real LVGL, just like on the device. When you are happy, press Export.', 'down']
];
function coach(i) {
  document.querySelectorAll('.tipcard').forEach(x => x.remove());
  const t = TIPS[i]; if (!t || innerWidth <= 900) return;
  const target = $(t[0]).getBoundingClientRect(), el = h(`<div class="tipcard glass" role="dialog" aria-label="${esc(t[1])}"><b>${esc(t[1])}</b><p>${esc(t[2])}</p><div class="tf"><span>${i + 1} of ${TIPS.length}</span><button class="primary" style="height:32px">${i < TIPS.length - 1 ? 'Next' : 'Got it'}</button></div></div>`);
  $('#app').appendChild(el);
  const r = el.getBoundingClientRect();
  const pos = t[3] == 'right' ? {left: target.right + 12, top: target.top + 40} : t[3] == 'up' ? {left: target.left + target.width / 2 - r.width / 2, top: target.top - r.height - 12} : {left: target.right - r.width, top: target.bottom + 12};
  el.style.left = clamp(pos.left, 12, innerWidth - r.width - 12) + 'px'; el.style.top = clamp(pos.top, 12, innerHeight - r.height - 12) + 'px';
  el.querySelector('button').onclick = () => coach(i + 1);
}

/* ---------------- canvas gestures ---------------- */
// Space or the middle button pans; two fingers pinch to zoom and drag to pan on touch screens.
let panKey = false, pan = null;
const touches = new Map();
document.addEventListener('keydown', e => { if (e.code == 'Space' && !e.repeat && !/input|textarea|select/i.test(e.target.tagName) && !$('#modalRoot').children.length) { panKey = true; vp.style.cursor = 'grab'; e.preventDefault(); } });
document.addEventListener('keyup', e => { if (e.code == 'Space') { panKey = false; vp.style.cursor = ''; } });
vp.addEventListener('pointerdown', e => {
  if (e.pointerType == 'touch') {
    touches.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (touches.size == 2) { e.stopPropagation(); if (drag) { onUp(); } const [a, b] = [...touches.values()]; pan = {pinch: Math.hypot(a.x - b.x, a.y - b.y), z: S.zoom, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2}; }
    else if (!e.target.closest('#frame')) pan = {x: e.clientX, y: e.clientY, sl: vp.scrollLeft, st: vp.scrollTop};
    return;
  }
  if (!(panKey || e.button == 1)) return;
  e.preventDefault(); e.stopPropagation(); vp.setPointerCapture(e.pointerId); vp.style.cursor = 'grabbing';
  pan = {x: e.clientX, y: e.clientY, sl: vp.scrollLeft, st: vp.scrollTop};
}, true);
vp.addEventListener('pointermove', e => {
  if (e.pointerType == 'touch' && touches.has(e.pointerId)) touches.set(e.pointerId, {x: e.clientX, y: e.clientY});
  if (!pan) return;
  if (pan.pinch && touches.size == 2) {
    const [a, b] = [...touches.values()], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    setZoom(pan.z * Math.hypot(a.x - b.x, a.y - b.y) / pan.pinch, {x: mx, y: my});
    vp.scrollLeft -= mx - pan.mx; vp.scrollTop -= my - pan.my; pan.mx = mx; pan.my = my; return;
  }
  if (pan.x != null) { vp.scrollLeft = pan.sl - (e.clientX - pan.x); vp.scrollTop = pan.st - (e.clientY - pan.y); }
}, true);
const endPan = e => { touches.delete(e.pointerId); if (pan && (!pan.pinch || touches.size < 2)) { pan = null; vp.style.cursor = panKey ? 'grab' : ''; } };
vp.addEventListener('pointerup', endPan, true); vp.addEventListener('pointercancel', endPan, true);

/* ---------------- appearance and focus ---------------- */
const THEME_ICONS = {auto: '<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,16.37a86.4,86.4,0,0,1,16,3V212.67a86.4,86.4,0,0,1-16,3Zm32,9.26a87.81,87.81,0,0,1,16,10.54V195.83a87.81,87.81,0,0,1-16,10.54ZM40,128a88.11,88.11,0,0,1,80-87.63V215.63A88.11,88.11,0,0,1,40,128Zm160,50.54V77.46a87.82,87.82,0,0,1,0,101.08Z"/>', light: '<path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/>', dark: '<path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"/>'};
function themeMode() { try { return localStorage.getItem('epixo.theme') || 'auto'; } catch (e) { return 'auto'; } }
function renderThemeBtn() { const m = themeMode(), b = $('#themeBtn'); b.innerHTML = ico(THEME_ICONS[m]); b.title = 'Appearance: ' + ({auto: 'automatic', light: 'light', dark: 'dark'})[m]; }
function setTheme(m) {
  try { m == 'auto' ? localStorage.removeItem('epixo.theme') : localStorage.setItem('epixo.theme', m); } catch (e) {}
  if (m == 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = m;
  renderThemeBtn(); toast(({auto: 'Appearance follows your system', light: 'Light appearance', dark: 'Dark appearance'})[m]);
}
$('#themeBtn').onclick = () => setTheme(({auto: 'light', light: 'dark', dark: 'auto'})[themeMode()]);
function toggleFocus() {
  const on = $('#app').classList.toggle('focus');
  $('#focusBtn').classList.toggle('on', on);
  if (S.lastFit) fit(); else applyZoom();
  if (on) toast('Focus mode. Press \\ to bring the panels back.');
}

/* ---------------- mobile ---------------- */
function closeMob() { if (innerWidth > 900) return; S.mob = null; $('#leftPanel').classList.remove('open'); $('#rightPanel').classList.remove('open'); document.querySelectorAll('#mobilebar button').forEach(b => b.classList.remove('on')); }
$('#mobilebar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const m = b.dataset.m;
  if (m == 'code') { closeMob(); toggleCode(); return; }
  if (S.mob == m) { closeMob(); return; } S.mob = m;
  document.querySelectorAll('#mobilebar button').forEach(x => x.classList.toggle('on', x == b));
  if (m == 'design' || m == 'doctor') { S.right = m; $('#leftPanel').classList.remove('open'); $('#rightPanel').classList.add('open'); renderRight(); }
  else { S.left = m; $('#rightPanel').classList.remove('open'); $('#leftPanel').classList.add('open'); renderLeft(); }
  segThumb($('#leftTabs')); segThumb($('#rightTabs'));
});
document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeMob);

/* ---------------- wiring ---------------- */
$('#leftTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.left = b.dataset.t; renderLeft(); });
$('#rightTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.right = b.dataset.t; if (S.right == 'doctor') DOC = E.doctor(S.p, measure); renderRight(); renderOverlay(); });
$('#pname').addEventListener('change', e => { push(); S.p.name = e.target.value.trim() || 'Untitled UI'; save(); renderHeader(); });
$('#saveState').onclick = openProjects;
$('#boardChip').onclick = openBoards; $('#aiBtn').onclick = () => openAI(); $('#exportBtn').onclick = () => openExport(); $('#palBtn').onclick = openPalette;
$('#undoBtn').onclick = undo; $('#redoBtn').onclick = redo; $('#codeBtn').onclick = toggleCode; $('#shotBtn').onclick = screenshot;
$('#playBtn').onclick = () => setMode(S.mode == 'preview' ? 'design' : 'preview'); $('#exitPrev').onclick = () => setMode('design');
$('#zoomIn').onclick = () => setZoom(S.zoom * 1.25); $('#zoomOut').onclick = () => setZoom(S.zoom / 1.25); $('#zoomV').onclick = fit; $('#focusBtn').onclick = toggleFocus;
vp.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(S.zoom * Math.exp(-clamp(e.deltaY, -40, 40) * .012), {x: e.clientX, y: e.clientY}); } }, {passive: false});
vp.addEventListener('pointerdown', e => { if (S.mode == 'design' && !e.target.closest('#frame') && S.sel) { S.sel = null; renderSel(); } });
addEventListener('resize', () => { if (S.lastFit) fit(); });
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase(), typing = tag == 'input' || tag == 'textarea' || tag == 'select' || e.target.isContentEditable, mod = e.metaKey || e.ctrlKey;
  if ($('#modalRoot').children.length) return;
  if (mod && e.key.toLowerCase() == 'k') { e.preventDefault(); openPalette(); return; }
  if (typing) return;
  if (mod && e.key.toLowerCase() == 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.key.toLowerCase() == 'y') { e.preventDefault(); redo(); return; }
  if (mod && e.key == '/') { e.preventDefault(); toggleCode(); return; }
  if (mod && e.key.toLowerCase() == 'd') { e.preventDefault(); dup(); return; }
  if (mod && e.key.toLowerCase() == 's') { e.preventDefault(); cloudSave().then(() => toast(cloudOk === true ? 'Saved to your account' : 'Saved in this browser')); return; }
  if (mod && e.key.toLowerCase() == 'c' && selW()) { S.clip = JSON.parse(JSON.stringify(selW())); toast('Copied widget'); return; }
  if (mod && e.key.toLowerCase() == 'v' && S.clip) { e.preventDefault(); mutate(() => { const n = Object.assign(JSON.parse(JSON.stringify(S.clip)), {id: 'w' + (++S.p.seq)}); S.p.counts[n.type] = (S.p.counts[n.type] || 0) + 1; n.name = E.uniqueWidgetName(cur(), E.TYPES[n.type].n.replace(/\W/g, '') + S.p.counts[n.type]); n.x = clamp(n.x + 12, 0, BW() - n.w); n.y = clamp(n.y + 12, 0, BH() - n.h); if (n.onTap && !S.p.screens.some(s => s.id == n.onTap.to)) n.onTap = null; cur().widgets.push(n); S.sel = n.id; }); return; }
  if (mod && (e.key == '=' || e.key == '+')) { e.preventDefault(); setZoom(S.zoom * 1.25); return; } if (mod && e.key == '-') { e.preventDefault(); setZoom(S.zoom / 1.25); return; }
  if (e.shiftKey && (e.key == '!' || e.code == 'Digit1')) { e.preventDefault(); fit(); return; }
  if (e.key.toLowerCase() == 'p' && !mod) { setMode(S.mode == 'preview' ? 'design' : 'preview'); return; }
  if (e.key == '\\' && !mod) { toggleFocus(); return; }
  if (e.key == '/' && !mod) { e.preventDefault(); $('#askIn').focus(); return; }
  if (e.key == 'Escape') { if (S.mode == 'preview') setMode('design'); else if (S.sel) { S.sel = null; renderSel(); } return; }
  const w = selW(); if (!w) return;
  if (e.key == 'Delete' || e.key == 'Backspace') { e.preventDefault(); del(); return; }
  const d = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[e.key];
  if (d && !w.locked) { e.preventDefault(); const k = e.shiftKey ? 10 : 1; if (!e.repeat) push(); w.x = clamp(w.x + d[0] * k, -w.w + 4, BW() - 4); w.y = clamp(w.y + d[1] * k, -w.h + 4, BH() - 4); const el = scrEl.querySelector(`[data-id="${w.id}"]`); if (el) el.replaceWith(wEl(w)); renderOverlay(); liveInspector(); liveSync(); save(); queueCode(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) cloudSave(); });

window.EpixoApp = {
  E, project: () => S.p, watch: fn => watchers.push(fn), view: () => ({screen: S.p.cur, selected: S.sel}),
  // A change made by an AI somewhere else. It lands as one undo step, keeps what the maker had open, and does not save back.
  applyRemote(p, msg) {
    p = migrate(p); if (!p) return false;
    const b = S.p.board, keepScreen = S.p.cur, keepSel = S.sel, sameProject = p.pid == S.p.pid;
    if (sameProject) push(); else { S.hist = []; S.fut = []; }
    S.p = p;
    if (sameProject && !msg.switchScreen && p.screens.some(s => s.id == keepScreen)) S.p.cur = keepScreen;
    S.sel = keepSel; fixSel(); boardChanged(b);
    if (ENG) { ENG.synced.clear(); syncAll(); } TH = null;
    try { localStorage.setItem(LKEY, JSON.stringify(S.p)); } catch (e) {}
    renderAll(); if (!sameProject) requestAnimationFrame(() => fit());
    if (msg.text) toast(msg.text);
    return true;
  }, toast, modal, xBtn, esc, cloudSave, newPid, engineOn: () => engineState == 'on',
  async png(scr) { for (let i = 0; i < 100 && engineState == 'loading'; i++) await new Promise(r => setTimeout(r, 100)); return engineState == 'on' ? renderPNG(scr) : null; },
  async open(p, msg) {
    await capsReady; p = migrate(p); if (!p) return false;
    if (CAP.db && CAP.uid && p.pid != S.p.pid) await cloudSave();
    const b = S.p.board; S.hist = []; S.fut = []; S.p = p; S.sel = null; S.lv = p.lvgl || 9; fixSel(); boardChanged(b);
    if (ENG) { ENG.synced.clear(); syncAll(); } TH = null; DOC = E.doctor(S.p, measure); save(); renderAll(); requestAnimationFrame(() => fit()); if (msg) toast(msg); return true;
  }
};
S.p = load(); S.lv = S.p.lvgl || 9;
DOC = E.doctor(S.p, measure);
renderThemeBtn(); renderAll();
requestAnimationFrame(() => { fit(); segThumb($('#leftTabs')); segThumb($('#rightTabs')); });
startEngine();
// First visit: a short welcome. Skipped when the page opens a project by link, or when an AI app drives the editor.
addEventListener('load', () => setTimeout(() => {
  if (seenWelcome() || /[?&](open|remix|template|board|new)=/.test(location.search) || document.querySelector('script[src="live.js"]') || $('#modalRoot').children.length) return;
  openWelcome(false);
}, 400));
})();
