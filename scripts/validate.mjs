#!/usr/bin/env node
/* ai-archi validator — structural + layout checks for generated diagrams.
   Usage: node scripts/validate.mjs <diagram.html>                        */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: node scripts/validate.mjs <diagram.html>'); process.exit(2); }
const html = readFileSync(file, 'utf8');

const errors = [], warns = [];
const err = m => errors.push(m);
const warn = m => warns.push(m);

/* --- structure --- */
if (!/^<!doctype html>/i.test(html.trim())) err('missing <!doctype html>');
const svgOpens = html.match(/<svg\b/g) || [];
if (!/<svg[^>]*id="diagram"/.test(html)) err('missing <svg id="diagram">');
if (svgOpens.length !== 1) warn(`expected exactly 1 <svg>, found ${svgOpens.length}`);
const vbMatch = html.match(/<svg[^>]*viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
if (!vbMatch) err('svg missing viewBox="0 0 W H"');
const VW = vbMatch ? +vbMatch[1] : 0, VH = vbMatch ? +vbMatch[2] : 0;
if (!/<title>[^<]+<\/title>/.test(html)) err('missing <title>');
for (const id of ['theme-vars', 'svg-style', 'ui-style', 'toast'])
  if (!html.includes(`id="${id}"`)) err(`missing #${id} (runtime region removed?)`);
if (!/\[data-theme="light"\]/.test(html) || !/\[data-theme="dark"\]/.test(html))
  err('#theme-vars must keep [data-theme="light"] and [data-theme="dark"] rules');

/* --- self-containedness --- */
if (/<link\b/i.test(html)) err('external <link> found — file must be self-contained');
if (/<script[^>]+src=/i.test(html)) err('external <script src> found');
const extUrl = html.match(/(?:src|href)="https?:\/\/[^"]+"/);
if (extUrl) err(`external URL reference: ${extUrl[0].slice(0, 80)}`);
if (/@import|url\(\s*['"]?https?:/i.test(html)) err('external CSS import/url() found');

/* --- ids unique, mpath targets exist --- */
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
if (dupes.length) err(`duplicate ids: ${[...new Set(dupes)].join(', ')}`);
for (const m of html.matchAll(/<mpath[^>]*href="#([^"]+)"/g))
  if (!ids.includes(m[1])) err(`mpath references missing id #${m[1]}`);
for (const m of html.matchAll(/marker-end="url\(#([^)]+)\)"/g))
  if (!ids.includes(m[1])) err(`marker-end references missing id #${m[1]}`);
for (const m of html.matchAll(/<use[^>]*href="#([^"]+)"/g))
  if (!ids.includes(m[1])) err(`<use> references missing symbol #${m[1]}`);

/* --- steps contiguous from 1 --- */
const steps = [...html.matchAll(/data-step="(\d+)"/g)].map(m => +m[1]);
if (steps.length) {
  const uniq = [...new Set(steps)].sort((a, b) => a - b);
  if (uniq[0] !== 1) err(`data-step must start at 1 (found ${uniq[0]})`);
  for (let i = 1; i < uniq.length; i++)
    if (uniq[i] !== uniq[i - 1] + 1) err(`data-step gap: ${uniq[i - 1]} → ${uniq[i]}`);
}

/* --- node layout: bounds + overlap --- */
const nodeRe = /<g class="node[^"]*" transform="translate\((-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)\)"[^>]*>[\s\S]*?<(?:rect|path) class="node-box"([^>]*)/g;
const nodes = [];
for (const m of html.matchAll(nodeRe)) {
  const attrs = m[3];
  const w = +(attrs.match(/width="(\d+(?:\.\d+)?)"/)?.[1] ?? 168);
  const h = +(attrs.match(/height="(\d+(?:\.\d+)?)"/)?.[1] ?? 56);
  nodes.push({ x: +m[1], y: +m[2], w, h });
}
if (nodes.length === 0) err('no .node elements found');
nodes.forEach((n, i) => {
  if (VW && (n.x < 0 || n.y < 0 || n.x + n.w > VW || n.y + n.h > VH))
    err(`node ${i + 1} at (${n.x},${n.y}) exceeds viewBox ${VW}×${VH}`);
});
for (let i = 0; i < nodes.length; i++)
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h)
      err(`nodes ${i + 1} (${a.x},${a.y}) and ${j + 1} (${b.x},${b.y}) overlap`);
    else {
      const gx = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w);
      const gy = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h);
      if (gx < 0 && gy >= 0 && gy < 20) warn(`nodes ${i + 1} and ${j + 1}: vertical gap ${gy}px (< 20)`);
      if (gy < 0 && gx >= 0 && gx < 40) warn(`nodes ${i + 1} and ${j + 1}: horizontal gap ${gx}px (< 40)`);
    }
  }

/* --- report --- */
for (const w of warns) console.log('  warn  ' + w);
for (const e of errors) console.log('  FAIL  ' + e);
if (errors.length) {
  console.log(`\n✗ ${file}: ${errors.length} error(s), ${warns.length} warning(s)`);
  process.exit(1);
}
console.log(`✓ ${file}: PASS (${nodes.length} nodes, ${steps.length ? Math.max(...steps) + ' steps' : 'no step player'}, ${warns.length} warning(s))`);
