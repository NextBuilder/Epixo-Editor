const E = require('../apps/editor/core.js');
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, 'cases');
const boards = [
  ['ws43', E.BOARDS.find(b => b.name == 'ESP32-S3-Touch-LCD-4.3'), 0],
  ['amoled175', E.BOARDS.find(b => b.name == 'ESP32-S3-Touch-AMOLED-1.75'), 0],
  ['cyd_land', E.BOARDS.find(b => b.name == 'ESP32-2432S028R'), 90],
  ['cyd_port', E.BOARDS.find(b => b.name == 'ESP32-2432S028R'), 0],
  ['ws169', E.BOARDS.find(b => b.name == 'ESP32-S3-Touch-LCD-1.69'), 0],
  ['tamoled', E.BOARDS.find(b => b.name == 'T-Display-S3 AMOLED'), 0],
  ['tab5', E.BOARDS.find(b => b.name == 'Tab5'), 0]
];
const cases = [];
for (const [bk, b0, rot] of boards) {
  const b = E.withRotation(b0, rot);
  for (const t of Object.keys(E.TPL)) {
    const p = E.blank(b); p.name = t + ' ' + bk;
    const ss = E.addTemplate(p, t, b.w, b.h, b.round); p.cur = ss[0].id;
    cases.push([t + '_' + bk, p]);
  }
}
{
  const b = E.BOARDS.find(x => x.name == 'ESP32-S3-Touch-LCD-4.3');
  const p = E.blank(b); p.name = 'kitchen sink';
  const s1 = E.mkScreen(p, 'Main', '#F2F3F7'), s2 = E.mkScreen(p, 'Second Page', '#101418'), s3 = E.mkScreen(p, '3rd', '#FFF4EE');
  const add = (s, t, pr) => { const w = E.mkW(p, t, pr); s.widgets.push(w); return w; };
  add(s1, 'panel', {x: 10, y: 10, w: 380, h: 220, radius: 30, border: 3, borderColor: '#FF0000', shadow: true});
  add(s1, 'label', {x: 20, y: 20, w: 200, h: 40, text: 'Left "quoted"\\ text', font: 22, align: 'left', valign: 'center'});
  add(s1, 'label', {x: 20, y: 70, w: 200, h: 60, text: 'Centre\nTwo lines', font: 18, align: 'center', valign: 'top', bg: '#DDEEFF', radius: 10});
  add(s1, 'label', {x: 20, y: 140, w: 200, h: 50, text: 'Right bottom', font: 14, align: 'right', valign: 'bottom', opacity: 60});
  add(s1, 'label', {x: 230, y: 20, w: 140, h: 30, text: 'Hidden', hidden: true});
  add(s1, 'button', {x: 420, y: 20, w: 160, h: 56, text: 'Go next', font: 24, onTap: {to: s2.id, anim: 'fade'}});
  add(s1, 'button', {x: 600, y: 20, w: 56, h: 56, text: '+', radius: 28, bg: '#FFFFFF', fg: '#0E1525', font: 30});
  add(s1, 'icon', {x: 680, y: 20, w: 48, h: 48, icon: 'wifi', onTap: {to: s3.id, anim: 'over_right'}});
  add(s1, 'switch', {x: 420, y: 100, w: 70, h: 40, checked: false});
  add(s1, 'switch', {x: 500, y: 100, w: 70, h: 40, checked: true, accent: '#FF2D55'});
  add(s1, 'slider', {x: 420, y: 170, w: 300, h: 12, value: 33, min: -50, max: 50});
  add(s1, 'checkbox', {x: 420, y: 210, w: 220, h: 32, text: 'Unchecked', checked: false});
  add(s1, 'checkbox', {x: 420, y: 250, w: 220, h: 32, text: 'Checked box', checked: true, font: 20});
  add(s1, 'dropdown', {x: 20, y: 250, w: 220, h: 50, options: 'One\nTwo\nThree "3"'});
  add(s1, 'arc', {x: 20, y: 310, w: 150, h: 150, value: 80});
  add(s1, 'arc', {x: 190, y: 310, w: 120, h: 120, value: 10, showValue: false, thick: 30, accent: '#00AA00'});
  add(s1, 'bar', {x: 330, y: 320, w: 200, h: 16, value: 70, radius: 0});
  add(s1, 'chart', {x: 330, y: 350, w: 250, h: 110, data: '5, -3, 10, 7 , 12,4'});
  add(s1, 'spinner', {x: 600, y: 330, w: 70, h: 70, thick: 8});
  add(s1, 'led', {x: 700, y: 330, w: 30, h: 30, checked: false, accent: '#FF0000'});
  add(s1, 'led', {x: 740, y: 330, w: 30, h: 30, checked: true});
  for (const ic of Object.keys(E.ICONS)) { const i = Object.keys(E.ICONS).indexOf(ic); add(s2, 'icon', {x: 10 + (i % 14) * 56, y: 10 + Math.floor(i / 14) * 60, w: 48, h: 48, icon: ic, fg: '#FFFFFF'}); }
  add(s2, 'label', {x: 10, y: 200, w: 760, h: 60, text: 'Back home', font: 48, fg: '#FFFFFF', onTap: {to: s1.id, anim: 'move_right'}});
  for (const f of E.FONTS) { const i = E.FONTS.indexOf(f); add(s3, 'label', {x: 10 + (i % 4) * 195, y: 10 + Math.floor(i / 4) * 90, w: 190, h: 80, text: 'Aa ' + f, font: f, align: 'center'}); }
  add(s3, 'panel', {x: 600, y: 400, w: 150, h: 60, radius: 12, shadow: false, opacity: 50, bg: '#0A6CFF'});
  p.cur = s1.id;
  cases.push(['kitchen_sink', p]);
}
fs.rmSync(out, {recursive: true, force: true});
for (const [name, p] of cases) {
  const d = path.join(out, name); fs.mkdirSync(d, {recursive: true});
  fs.writeFileSync(d + '/project.json', JSON.stringify(p));
  fs.writeFileSync(d + '/script.txt', E.toScript(p));
  fs.writeFileSync(d + '/ui.c', E.genC(p, {lvgl: 9}));
  fs.writeFileSync(d + '/ui_v8.c', E.genC(p, {lvgl: 8}));
  fs.writeFileSync(d + '/ui_v96.c', E.genC(p, {lvgl: 96}));
  fs.writeFileSync(d + '/ui.h', E.genH(p));
  fs.writeFileSync(d + '/ui.py', E.genPy(p));
  const xs = E.genXML(p); fs.mkdirSync(d + '/xml', {recursive: true}); xs.forEach(x => fs.writeFileSync(d + '/xml/' + x.name + '.xml', x.xml)); fs.writeFileSync(d + '/xml/index.txt', xs.map(x => x.name).join('\n') + '\n'); fs.writeFileSync(d + '/xml/skipped.txt', xs.skipped.join('\n'));
  fs.writeFileSync(d + '/epixo.yaml', E.genYAML(p).yaml);
  fs.writeFileSync(d + '/screens.txt', p.screens.map(s => E.ident(s.name).toLowerCase()).join('\n') + '\n');
  fs.writeFileSync(d + '/meta.txt', [p.board.w, p.board.h, p.screens.map(s => E.sid(s.id)).join(',')].join(' '));
}
console.log(cases.length + ' cases');
