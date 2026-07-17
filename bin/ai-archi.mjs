#!/usr/bin/env node
/* ai-archi CLI — render / check / icons / new / demo / doctor. Zero deps. */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [cmd, ...args] = process.argv.slice(2);

const run = (script, sargs) => {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...sargs], { stdio: 'inherit' });
  return r.status ?? 1;
};

async function render(input, output) {
  const { renderArchitecture } = await import(join(ROOT, 'renderers', 'render-architecture.mjs'));
  const ir = JSON.parse(readFileSync(input, 'utf8'));
  const out = output ?? input.replace(/(\.architecture)?\.json$/, '.html');
  writeFileSync(out, renderArchitecture(ir));
  console.log(`rendered ${out}`);
  return { out, status: run('validate.mjs', [out]) };
}

switch (cmd) {
  case 'render': {
    if (!args[0]) { console.error('usage: ai-archi render <input.json> [output.html]'); process.exit(2); }
    const { status } = await render(resolve(args[0]), args[1] && resolve(args[1]));
    process.exit(status);
  }
  case 'check':
  case 'validate': {
    if (!args[0]) { console.error('usage: ai-archi check <file.html>'); process.exit(2); }
    process.exit(run('validate.mjs', [resolve(args[0])]));
  }
  case 'icons':
    process.exit(run('icons.mjs', args));
  case 'new': {
    if (!args[0]) { console.error('usage: ai-archi new <output.html>'); process.exit(2); }
    const out = resolve(args[0]);
    if (existsSync(out)) { console.error(`refusing to overwrite ${out}`); process.exit(1); }
    copyFileSync(join(ROOT, 'templates', 'diagram.html'), out);
    console.log(`created ${out} from the canonical template — replace the SVG block per SKILL.md`);
    break;
  }
  case 'demo': {
    const dir = resolve(args[0] ?? '.');
    mkdirSync(dir, { recursive: true });
    const { status } = await render(join(ROOT, 'examples', 'ai-platform.architecture.json'), join(dir, 'ai-platform.html'));
    if (status === 0) console.log('open it in a browser — try T (theme), Space (step player), C (copy PNG)');
    process.exit(status);
  }
  case 'doctor': {
    let ok = true;
    const need = ['templates/diagram.html', 'renderers/render-architecture.mjs', 'schemas/architecture.schema.json',
      'scripts/validate.mjs', 'scripts/icons.mjs', 'assets/core.svg', 'assets/tech.svg', 'assets/shapes.svg',
      'examples/ai-platform.architecture.json'];
    const major = +process.versions.node.split('.')[0];
    console.log(`node ${process.versions.node} ${major >= 18 ? '✓' : '✗ (need >= 18)'}`);
    if (major < 18) ok = false;
    for (const f of need) {
      const there = existsSync(join(ROOT, f));
      if (!there) { console.log(`missing ${f} ✗`); ok = false; }
    }
    if (ok) console.log(`all ${need.length} skill files present ✓`);
    try {
      const { status } = await render(join(ROOT, 'examples', 'ai-platform.architecture.json'),
        join(tmpdir(), 'ai-archi-doctor.html'));
      if (status !== 0) ok = false;
    } catch (e) { console.log(`render failed ✗\n${e.message}`); ok = false; }
    console.log(ok ? 'doctor: healthy ✓' : 'doctor: problems found ✗');
    process.exit(ok ? 0 : 1);
  }
  default:
    console.log(`ai-archi — animated diagram toolkit

usage: node bin/ai-archi.mjs <command>

  render <input.json> [out.html]   render an architecture IR and validate the artifact
  check  <file.html>               validate any generated diagram (structure + layout)
  icons  list|grep|pick ...        browse/extract asset-library icons
  new    <out.html>                scaffold a hand-authored diagram from the template
  demo   [dir]                     render the example diagram, ready to open
  doctor                           verify the installation end to end`);
    process.exit(cmd ? 2 : 0);
}
