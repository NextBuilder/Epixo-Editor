// Live link to the Epixo MCP server. Only loaded when the editor is served by apps/mcp/server.mjs.
(() => {
'use strict';
const A = window.EpixoApp;
if (!A || !window.EventSource) return;
const me = Math.random().toString(36).slice(2, 10);
let last = '', rev = 0, putT, view = '', first = true;

const pill = document.createElement('button');
pill.className = 'livepill'; pill.type = 'button';
pill.innerHTML = '<i></i><span>Connecting</span>';
pill.title = 'This editor is linked to your AI app through the Epixo MCP server.';
document.querySelector('header.top .brand').after(pill);
const state = (on, text) => { pill.classList.toggle('on', on); pill.querySelector('span').textContent = text; };

const es = new EventSource('/live/events?client=' + me);
es.onopen = () => state(true, 'Live with AI');
es.onerror = () => state(false, 'Reconnecting');
es.addEventListener('project', e => {
  const d = JSON.parse(e.data);
  rev = d.rev; last = JSON.stringify(d.project);
  if (first) { A.open(d.project).then(() => { last = JSON.stringify(A.project()); first = false; }); return; }
  A.applyRemote(d.project, {text: d.why ? (d.who || 'AI') + ': ' + d.why : '', switchScreen: /^Designed|^Added a template|^Opened|^New project/.test(d.why || '')});
  pill.classList.remove('pulse'); void pill.offsetWidth; pill.classList.add('pulse');
});

A.watch(p => {
  const j = JSON.stringify(p);
  if (j === last || first) return;
  last = j; clearTimeout(putT);
  putT = setTimeout(() => fetch('/live/project', {method: 'PUT', headers: {'content-type': 'application/json', 'x-epixo-client': me}, body: j}).then(r => r.ok && r.json()).then(r => { if (r) rev = r.rev; }).catch(() => {}), 250);
});

setInterval(() => {
  const v = JSON.stringify(A.view());
  if (v === view) return;
  view = v;
  fetch('/live/view', {method: 'PUT', headers: {'content-type': 'application/json'}, body: v}).catch(() => {});
}, 400);
})();
