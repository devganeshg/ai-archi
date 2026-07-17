#!/usr/bin/env node
/* ai-archi icon CLI — browse the asset libraries and print defs-ready symbols.
   Usage:
     node scripts/icons.mjs list
     node scripts/icons.mjs grep <term>
     node scripts/icons.mjs pick <id> [id...]   # paste output into <defs>   */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const libs = {};
for (const f of readdirSync(assetsDir).filter(f => f.endsWith('.svg'))) {
  const src = readFileSync(join(assetsDir, f), 'utf8');
  const symbols = {};
  for (const m of src.matchAll(/<symbol id="([^"]+)"[\s\S]*?<\/symbol>/g))
    symbols[m[1]] = m[0];
  libs[basename(f, '.svg')] = symbols;
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'list') {
  for (const [lib, syms] of Object.entries(libs))
    console.log(`${lib} (${Object.keys(syms).length}):\n  ${Object.keys(syms).join('  ')}`);
} else if (cmd === 'grep' && args[0]) {
  const t = args[0].toLowerCase();
  for (const [lib, syms] of Object.entries(libs))
    for (const id of Object.keys(syms))
      if (id.toLowerCase().includes(t)) console.log(`${lib}/${id}`);
} else if (cmd === 'pick' && args.length) {
  let missing = 0;
  for (const id of args) {
    const lib = Object.values(libs).find(s => s[id]);
    if (!lib) { console.error(`  FAIL  no icon "${id}" — try: node scripts/icons.mjs grep ${id.replace(/^[is]-/, '')}`); missing++; continue; }
    console.log(lib[id].replace(/^/gm, '    '));
  }
  process.exit(missing ? 1 : 0);
} else {
  console.log('usage: icons.mjs list | grep <term> | pick <id> [id...]');
  process.exit(2);
}
