(function (root) {
'use strict';

const L5 = new Uint8Array(32), L6 = new Uint8Array(64);
for (let i = 0; i < 32; i++) L5[i] = (i * 255 / 31 + .5) | 0;
for (let i = 0; i < 64; i++) L6[i] = (i * 255 / 63 + .5) | 0;

let modPromise = null;
function compile(url) {
  if (!modPromise) {
    modPromise = fetch(url).then(r => {
      if (!r.ok) throw new Error('engine download failed (' + r.status + ')');
      return r.arrayBuffer();
    }).then(b => WebAssembly.compile(b));
  }
  return modPromise;
}

class Engine {
  static async create(url, w, h) {
    const mod = await compile(url);
    const inst = await WebAssembly.instantiate(mod, {});
    const e = new Engine(inst.exports);
    e.init(w, h);
    return e;
  }
  constructor(x) {
    this.x = x;
    x._initialize();
    this.enc = new TextEncoder();
    this.w = 0; this.h = 0;
  }
  init(w, h) {
    if (!this.x.ep_init(w, h)) throw new Error('engine could not allocate a ' + w + '×' + h + ' screen');
    this.w = w; this.h = h;
    this.fbPtr = this.x.ep_fb();
    this.img = null;
    this.synced = new Map();
  }
  str(s) {
    const b = this.enc.encode(s + '\0');
    const p = this.x.ep_alloc(b.length);
    new Uint8Array(this.x.memory.buffer, p, b.length).set(b);
    return p;
  }
  exec(script) {
    if (!script) return;
    const p = this.str(script);
    this.x.ep_exec(p);
    this.x.ep_free(p);
  }
  measure(font, text) {
    const p = this.str(String(text));
    const w = this.x.ep_text_width(font, p);
    this.x.ep_free(p);
    return w;
  }
  pointer(x, y, down) { this.x.ep_pointer(x | 0, y | 0, down ? 1 : 0); }
  tick(ms) { return this.x.ep_tick(Math.max(0, Math.min(1000, ms | 0))); }
  refresh() { this.x.ep_refresh(); }
  active() { return this.x.ep_active(); }
  value(id) { return this.x.ep_value(id); }
  paint(ctx) {
    const w = this.w, h = this.h;
    if (!this.img || this.img.width !== w || this.img.height !== h) this.img = ctx.createImageData(w, h);
    const src = new Uint16Array(this.x.memory.buffer, this.fbPtr, w * h);
    const dst = new Uint32Array(this.img.data.buffer);
    for (let i = 0, n = w * h; i < n; i++) {
      const c = src[i];
      dst[i] = 0xFF000000 | (L5[c & 31] << 16) | (L6[(c >> 5) & 63] << 8) | L5[c >> 11];
    }
    ctx.putImageData(this.img, 0, 0);
  }
  renderTo(ctx, settleMs) {
    for (let t = 0; t < (settleMs || 400); t += 50) this.tick(50);
    this.refresh();
    this.paint(ctx);
  }
}

root.EpixoEngine = Engine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
