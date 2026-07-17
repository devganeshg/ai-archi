/* ai-archi architecture renderer — JSON IR → animated self-contained HTML.
   Deterministic grid math, no auto-layout: the IR names cells, this file
   computes pixels. Output is the canonical template with its SVG replaced,
   so rendered diagrams get the full runtime (theme, motion, step player,
   copy/export) and library icons with zero extra work.                    */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const GRID = { marginX: 60, top: 120, colPitch: 240, rowPitch: 100, nodeW: 168, nodeH: 56 };
const CATS = {
  client: 'i-client', gateway: 'i-gateway', compute: 'i-compute', storage: 'i-storage',
  queue: 'i-queue', external: 'i-external', security: 'i-security', observe: 'i-observe',
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r1 = n => Math.round(n * 10) / 10;
/* Text-width estimate by character class: CJK at full em (archify heuristic),
   narrow/wide/caps latin classes for system-ui sans. Rough but honest ~8%. */
const charEm = ch =>
  /[\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]/.test(ch) ? 1
  : /[iljftrI!.,'\u00b7:;\s()[\]|-]/.test(ch) ? 0.34
  : /[mwMW@%]/.test(ch) ? 0.9
  : /[A-Z0-9]/.test(ch) ? 0.68
  : 0.55;
const estWidth = (s, fs) => [...String(s)].reduce((w, ch) => w + charEm(ch) * fs, 0);

function loadSymbols() {
  const map = {};
  const dir = join(ROOT, 'assets');
  for (const f of readdirSync(dir).filter(f => f.endsWith('.svg'))) {
    const src = readFileSync(join(dir, f), 'utf8');
    for (const m of src.matchAll(/<symbol id="([^"]+)"[\s\S]*?<\/symbol>/g)) map[m[1]] = m[0];
  }
  return map;
}

function orthPath(pts) {
  const p = pts.filter((q, i) => i === 0 || q[0] !== pts[i - 1][0] || q[1] !== pts[i - 1][1]);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  for (let i = 1; i < p.length; i++) {
    const [x, y] = p[i];
    if (i < p.length - 1) {
      const [px, py] = p[i - 1], [nx, ny] = p[i + 1];
      const ax = x - Math.sign(x - px) * 4, ay = y - Math.sign(y - py) * 4;
      const bx = x + Math.sign(nx - x) * 4, by = y + Math.sign(ny - y) * 4;
      d += ` L${r1(ax)} ${r1(ay)} Q${r1(x)} ${r1(y)} ${r1(bx)} ${r1(by)}`;
    } else d += ` L${r1(x)} ${r1(y)}`;
  }
  return d;
}

function longestSegment(pts) {
  let best = null, bestLen = -1;
  for (let i = 1; i < pts.length; i++) {
    const len = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
    if (len > bestLen) { bestLen = len; best = [pts[i - 1], pts[i]]; }
  }
  return best;
}

export function renderArchitecture(ir) {
  const problems = [];
  const fail = m => problems.push(m);

  if (ir.diagram !== 'architecture')
    fail(`diagram must be "architecture" (got "${ir.diagram}") — other types are hand-authored for now, see SKILL.md.`);
  if (!ir.title) fail('title is required.');
  const nodes = ir.nodes ?? [], edges = ir.edges ?? [], zones = ir.zones ?? [];
  if (!nodes.length) fail('at least one node is required.');

  const symbols = loadSymbols();
  const byId = new Map(), cells = new Map();
  for (const n of nodes) {
    if (byId.has(n.id)) fail(`duplicate node id "${n.id}".`);
    byId.set(n.id, n);
    if (!CATS[n.type]) fail(`node "${n.id}": type "${n.type}" invalid — one of ${Object.keys(CATS).join(', ')}.`);
    if (!Number.isFinite(n.col) || !Number.isFinite(n.row) || n.col < 0 || n.row < 0)
      fail(`node "${n.id}": col/row must be non-negative numbers.`);
    const key = `${n.col},${n.row}`;
    if (cells.has(key)) fail(`nodes "${cells.get(key)}" and "${n.id}" share cell col ${n.col} row ${n.row} — move one.`);
    cells.set(key, n.id);
    n.w = n.width ?? GRID.nodeW;
    n.x = GRID.marginX + n.col * GRID.colPitch;
    n.y = GRID.top + n.row * GRID.rowPitch;
    n.iconId = n.icon ?? CATS[n.type];
    if (n.icon && !symbols[n.icon])
      fail(`node "${n.id}": icon "${n.icon}" not in asset libraries — run: node scripts/icons.mjs grep ${n.icon.replace(/^[is]-/, '')}`);
    /* estimator is ~±8%, so only flag overflows beyond that tolerance */
    const avail = n.w - 62;
    if (estWidth(n.label ?? '', 13.5) > avail * 1.08)
      fail(`node "${n.id}": label "${n.label}" is ~${Math.round(estWidth(n.label, 13.5))}px, wider than the ${avail}px slot — shorten it or set "width": ${Math.ceil(estWidth(n.label, 13.5)) + 70}.`);
    if (n.sublabel && estWidth(n.sublabel, 10.5) > avail * 1.08)
      fail(`node "${n.id}": sublabel wider than the node — shorten it or set "width": ${Math.ceil(estWidth(n.sublabel, 10.5)) + 70}.`);
  }
  for (const n of nodes) {
    if (n.width && n.x + n.w > GRID.marginX + (n.col + 1) * GRID.colPitch - 40)
      fail(`node "${n.id}": width ${n.w} overflows its column (max ${GRID.colPitch - 40}).`);
  }

  for (const z of zones)
    for (const id of z.nodes ?? [])
      if (!byId.has(id)) fail(`zone "${z.id}": unknown node "${id}".`);

  const steps = [];
  for (const e of edges) {
    for (const end of [e.from, e.to])
      if (!byId.has(end)) fail(`edge ${e.from}→${e.to}: unknown node "${end}".`);
    if (e.step != null) steps.push(e.step);
  }
  const uniq = [...new Set(steps)].sort((a, b) => a - b);
  uniq.forEach((s, i) => { if (s !== i + 1) fail(`steps must be contiguous from 1 — got ${uniq.join(', ')}.`); });

  if (problems.length) {
    const err = new Error('invalid architecture IR:\n  - ' + problems.join('\n  - '));
    err.problems = problems;
    throw err;
  }

  /* ---- edge geometry ---- */
  const side = e => {
    const s = byId.get(e.from), t = byId.get(e.to);
    const dc = t.col - s.col;
    return dc > 0 ? 'right' : dc < 0 ? 'left' : (t.row > s.row ? 'bottom' : 'top');
  };
  const groups = new Map();
  edges.forEach(e => {
    const k = e.from + '|' + side(e);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(e);
  });
  for (const g of groups.values()) {
    g.sort((a, b) => (byId.get(a.to).y - byId.get(b.to).y) || (byId.get(a.to).x - byId.get(b.to).x));
    g.forEach((e, i) => { e._off = (i - (g.length - 1) / 2) * 14; e._ch = i; });
  }

  const geo = edges.map(e => {
    const s = byId.get(e.from), t = byId.get(e.to), sd = side(e), off = e._off;
    let pts;
    if (sd === 'right') {
      const y1 = s.y + 28 + off, y2 = t.y + 28;
      if (s.row === t.row) pts = [[s.x + s.w, y1], [t.x - 4, y1]];
      else {
        const ch = Math.min(s.x + s.w + 34 + e._ch * 12, t.x - 16);
        pts = [[s.x + s.w, y1], [ch, y1], [ch, y2], [t.x - 4, y2]];
      }
    } else if (sd === 'left') {
      const y1 = s.y + 28 + off, y2 = t.y + 28;
      if (s.row === t.row) pts = [[s.x, y1], [t.x + t.w + 4, y1]];
      else {
        const ch = Math.max(s.x - 34 - e._ch * 12, t.x + t.w + 16);
        pts = [[s.x, y1], [ch, y1], [ch, y2], [t.x + t.w + 4, y2]];
      }
    } else if (sd === 'bottom') {
      const scx = s.x + s.w / 2 + off, tcx = t.x + t.w / 2;
      pts = scx === tcx ? [[scx, s.y + GRID.nodeH], [tcx, t.y - 4]]
        : [[scx, s.y + GRID.nodeH], [scx, t.y - 30], [tcx, t.y - 30], [tcx, t.y - 4]];
    } else {
      const scx = s.x + s.w / 2 + off, tcx = t.x + t.w / 2;
      pts = scx === tcx ? [[scx, s.y], [tcx, t.y + GRID.nodeH + 4]]
        : [[scx, s.y], [scx, t.y + GRID.nodeH + 30], [tcx, t.y + GRID.nodeH + 30], [tcx, t.y + GRID.nodeH + 4]];
    }
    return { e, pts };
  });

  /* ---- extents ---- */
  const zoneBoxes = zones.map(z => {
    const ns = z.nodes.map(id => byId.get(id));
    const x = Math.min(...ns.map(n => n.x)) - 24, y = Math.min(...ns.map(n => n.y)) - 36;
    return { z, x, y,
      w: Math.max(...ns.map(n => n.x + n.w)) + 24 - x,
      h: Math.max(...ns.map(n => n.y)) + GRID.nodeH + 20 - y };
  });
  const W = Math.max(...nodes.map(n => n.x + n.w), ...zoneBoxes.map(b => b.x + b.w)) + GRID.marginX;
  const H = Math.max(...nodes.map(n => n.y), ...zoneBoxes.map(b => b.y + b.h - GRID.nodeH)) + GRID.nodeH + 44;

  /* ---- svg ---- */
  const out = [];
  out.push(`<svg id="diagram" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="Architecture diagram: ${esc(ir.title)}">`);
  const usedIcons = [...new Set(nodes.map(n => n.iconId))];
  out.push('  <defs>', `    <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 .6 L9.4 5 L0 9.4 z" class="arrow-head"/>
    </marker>`);
  for (const id of usedIcons) out.push(symbols[id].replace(/^/gm, '    '));
  out.push('  </defs>', '', `  <rect class="dg-bg" x="0" y="0" width="${W}" height="${H}"/>`, '');
  out.push('  <g class="dg-head">', `    <text class="dg-title" x="40" y="46">${esc(ir.title)}</text>`);
  if (ir.subtitle) out.push(`    <text class="dg-sub" x="40" y="66">${esc(ir.subtitle)}</text>`);
  out.push('  </g>', '');

  zoneBoxes.forEach((b, i) => {
    const accent = b.z.accent ? ` style="stroke:var(--cat-${b.z.accent});stroke-opacity:.6"` : '';
    out.push(`  <g class="zone" style="--d:${r1(0.05 * (i + 1))}s">`,
      `    <rect class="zone-box" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="16"${accent}/>`,
      `    <text class="zone-title" x="${b.x + 16}" y="${b.y + 22}">${esc(b.z.label ?? b.z.id).toUpperCase()}</text>`,
      '  </g>');
  });
  out.push('');

  geo.forEach(({ e, pts }, j) => {
    const t = byId.get(e.to);
    const cat = e.accent ?? t.type;
    const d = orthPath(pts);
    const stepAttr = e.step != null ? ` data-step="${e.step}"` : '';
    const flow = e.flow ?? (e.step != null && !e.dotted);
    const eid = `e${j + 1}`;
    out.push(`  <g class="edge-g cat-${cat}"${stepAttr} style="--d:${r1(0.55 + j * 0.05)}s">`);
    out.push(`    <path id="${eid}" class="edge${e.dotted ? ' dotted' : ''}" d="${d}" marker-end="url(#arrow)"/>`);
    if (flow) out.push(`    <path class="edge-flow" d="${d}"/>`);
    if (e.label) {
      const [[x1, y1], [x2, y2]] = longestSegment(pts);
      const dy = e.labelDy ?? 0;
      if (y1 === y2) out.push(`    <text class="edge-label" x="${r1((x1 + x2) / 2)}" y="${r1(y1 - 7 + dy)}" text-anchor="middle">${esc(e.label)}</text>`);
      else out.push(`    <text class="edge-label" x="${r1(x1 + 9)}" y="${r1((y1 + y2) / 2 + dy)}">${esc(e.label)}</text>`);
    }
    if (e.packet) out.push(`    <circle class="packet" r="3.4"><animateMotion dur="${r1(1.6 + (j % 3) * 0.4)}s" begin="${r1((j % 4) * 0.5)}s" repeatCount="indefinite"><mpath href="#${eid}"/></animateMotion></circle>`);
    out.push('  </g>');
  });
  out.push('');

  [...nodes].sort((a, b) => (a.col - b.col) || (a.row - b.row)).forEach((n, i) => {
    out.push(`  <g class="node cat-${n.type}" transform="translate(${n.x} ${n.y})" style="--d:${r1(0.05 + i * 0.07)}s"><g class="node-in">`,
      `    <rect class="node-box" width="${n.w}" height="56" rx="13"/>`,
      `    <rect class="node-chip" x="10" y="12" width="32" height="32" rx="9"/>`,
      `    <use class="node-icon" href="#${n.iconId}" x="14" y="16" width="24" height="24"/>`,
      `    <text class="node-title" x="52" y="${n.sublabel ? 26 : 32}">${esc(n.label)}</text>`);
    if (n.sublabel) out.push(`    <text class="node-sub" x="52" y="42">${esc(n.sublabel)}</text>`);
    out.push('  </g></g>');
  });
  out.push('</svg>');

  /* ---- inject into template shell ---- */
  const tpl = readFileSync(join(ROOT, 'templates', 'diagram.html'), 'utf8');
  const html = tpl
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(ir.title)}</title>`)
    .replace(/<h1 id="docTitle">[\s\S]*?<\/h1>/, `<h1 id="docTitle">${esc(ir.title)}</h1>`)
    .replace(/(<!-- =+ DIAGRAM =+ -->)[\s\S]*?(<!-- =+ END DIAGRAM =+ -->)/,
      (_, a, b) => `${a}\n${out.join('\n')}\n${b}`);
  if (!html.includes(`viewBox="0 0 ${W} ${H}"`)) throw new Error('template markers not found — templates/diagram.html was modified.');
  return html;
}

/* CLI entry: node renderers/render-architecture.mjs <input.json> <output.html> */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { writeFileSync } = await import('node:fs');
  const [input, output] = process.argv.slice(2);
  if (!input || !output) { console.error('usage: render-architecture.mjs <input.json> <output.html>'); process.exit(2); }
  const html = renderArchitecture(JSON.parse(readFileSync(input, 'utf8')));
  writeFileSync(output, html);
  console.log(`rendered ${output}`);
}
