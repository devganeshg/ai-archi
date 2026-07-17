# Changelog

## 0.3.0 — 2026-07-17

- **Architecture renderer**: `renderers/render-architecture.mjs` turns a small
  JSON IR (grid cells, not pixels) into the full animated template — geometry,
  orthogonal edge routing with fan-out, zone boxes, library-icon inlining,
  flow/packet animation, and step-player wiring are all computed
  deterministically. Layout problems fail fast with the fix in the message
  (label-width overflow via a per-character-class width estimator with CJK
  support, cell collisions, contiguous steps, unknown refs).
- **`bin/ai-archi.mjs` CLI**: `render`, `check`, `icons`, `new`, `demo`,
  `doctor`.
- **`schemas/architecture.schema.json`** documenting the IR.
- **`examples/ai-platform.architecture.json`** + its rendered HTML.
- SKILL.md: renderer-first workflow, layout principles, Mermaid as an input
  dialect (flowchart/sequenceDiagram/stateDiagram/classDiagram mapping).
- CI: GitHub Actions runs `doctor` + template validation on every push/PR.

## 0.2.0 — 2026-07-17

- Three asset libraries (46 brand-neutral 24×24 glyphs): `core`, `tech`,
  `shapes`, cataloged in `assets/INDEX.md`.
- `scripts/icons.mjs`: list / grep / pick CLI printing defs-ready symbols.
- Keyboard shortcuts: T theme, M motion, C copy, E export, ←/→/Space/Esc steps.

## 0.1.0 — 2026-07-17

- Initial release: canonical template (dark/light themes, animated flow edges,
  packets, step player, copy-PNG, 1–4× PNG/JPEG/WebP + scheme-adaptive SVG
  export), SKILL.md, diagram-type recipes, semantic tech labels,
  structural/layout validator.
