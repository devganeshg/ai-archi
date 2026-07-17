# Roadmap

## Design boundaries (what ai-archi is)

- Output is always a **single self-contained HTML file** — no server, no CDN,
  no runtime deps. Anything that breaks this is out of scope.
- **Animation is a first-class citizen**: flow edges, packets, and the step
  player ship by default and must always freeze to a complete static frame
  for export.
- Renderers do **deterministic cell math, not auto-layout** — the IR (or the
  agent) decides placement; the renderer computes pixels and refuses bad
  layouts with actionable messages.
- Icons stay **brand-neutral, hand-drawn, stroke-based** — no trademark
  logomarks, no icon fonts.

## Next

- [ ] **Sequence renderer** — participants + messages IR → lifelines,
      activation bars, auto `data-step` on every message (the step player is
      the killer feature here)
- [ ] **Workflow renderer** — lanes/columns IR with decision diamonds,
      exception lanes, `mainPath` narration
- [ ] **Lifecycle renderer** — states/transitions IR, happy-path ring layout
- [ ] Edge-crossing detection in `validate.mjs` (edge path vs node rects,
      with suggested reroute)
- [ ] `node --test` suite: geometry, fan offsets, width estimator, IR
      validation messages, golden-file render of the example
- [ ] More icon libraries: `data.svg` (formats: parquet, json, proto),
      `infra.svg` (dns, vpn, bastion, cert)
- [ ] Packaging for `npx skills add devganeshg/ai-archi` and Codex/opencode
      installs
- [ ] Docs site (GitHub Pages) with a gallery of all five types, light and
      dark screenshots
- [ ] Optional `pos: [x, y]` free placement override in the architecture IR
      (grid stays the default)

## Non-goals

- Force-directed / automatic graph layout — determinism beats magic
- Editing diagrams in the browser — iterate by chat, re-render
- Mermaid *output* — Mermaid is an input dialect only
