# ai-archi

[![License: MIT](https://img.shields.io/badge/License-MIT-8d87ff.svg)](LICENSE)
[![Agent skill](https://img.shields.io/badge/Claude_Code-agent_skill-4f46cf.svg)](SKILL.md)
[![Zero dependencies](https://img.shields.io/badge/dependencies-zero-147a4e.svg)](templates/diagram.html)

An agent skill for Claude Code that turns a plain-English description of your
system into a polished, **animated**, self-contained technical diagram — a
single HTML file you can open, theme-toggle, copy to the clipboard, and export
at maximum resolution.

## Features

- **No design skills needed** — describe your architecture in English, get a diagram
- **Six diagram types** — architecture, LLD (class/module internals), sequence,
  workflow (approvals, CI/CD, runbooks), data-flow (pipelines, PII boundaries),
  lifecycle (state machines)
- **Animated** — staggered entrances, marching-dash flow edges, packet dots
  traveling the request path, and a pause/resume toggle
- **Step player** — diagrams with a narrated flow get ‹ ▶ › controls that walk
  the path step by step (auto-play included); ideal for sequence diagrams and
  runbooks
- **Built-in theme toggle** — one click between dark and light, persists across
  sessions, respects the system preference on first load
- **Copy PNG to clipboard** — one click, paste straight into Slack / Notion / GitHub
- **Ultra-crisp export** — PNG / JPEG / WebP rendered natively at 1–4× source
  resolution (no upsampling blur), or SVG for true vector
- **SVG follows system dark/light** — exported SVGs ship both variable sets +
  `@media (prefers-color-scheme)`, so one SVG in a GitHub README follows the
  reader's color preference
- **Validation loop built in** — `scripts/validate.mjs` checks structure,
  self-containedness, id integrity, step contiguity, and node-overlap layout
- **Semantic tech labels** — `aws.lambda`, `postgres`, `redis`,
  `github-actions`, `openai`, … map to the right visual category with no icon
  library
- **Self-contained HTML** — zero dependencies, share by sending the file
- **Iterate by chat** — "add Redis", "move auth to the left", "use emerald for
  the API"

## Install

Personal (all projects):

```bash
git clone https://github.com/devganeshg/ai-archi.git
ln -s "$(pwd)/ai-archi" ~/.claude/skills/ai-archi
```

Or per-project: copy this folder to `<project>/.claude/skills/ai-archi`.

Then in Claude Code:

```
/ai-archi checkout flow: web client → api gateway → order service → postgres,
payments via stripe, events on kafka to an email worker
```

or just ask naturally: *"draw the architecture for …"*, *"sequence diagram of
the login flow"*, *"animate the CI/CD pipeline"*.

## Layout

```
SKILL.md                    the agent skill (workflow + SVG building rules)
templates/diagram.html      canonical template: full runtime + demo diagram
references/diagram-types.md per-type layout recipes (sequence, LLD, …)
references/tech-labels.md   semantic label → category mapping
scripts/validate.mjs        structural + layout validator
```

`templates/diagram.html` is itself a working demo — open it in a browser.

## How generated files work

The runtime (`<script>` + `#ui-style`) is generic and never edited; the agent
replaces only the `<svg id="diagram">` block, the title, and optionally the
`#theme-vars` palette. Exports clone the SVG, strip animations (resting states
are final states by design), inline the diagram CSS with the active theme's
variables, and rasterize on a canvas at the chosen scale — or emit a
scheme-adaptive standalone SVG.

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the layout
of the codebase, the four invariants every change must keep, and how to test.

## License

[MIT](LICENSE) © 2026 Ganesh Giri
