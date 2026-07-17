---
name: ai-archi
description: Generate beautiful animated architecture, LLD, workflow, sequence, data-flow, and lifecycle diagrams as a single self-contained HTML file — dark/light toggle, animated flow edges, step-by-step playback, copy-PNG-to-clipboard, and crisp up-to-4× PNG/JPEG/WebP/SVG export. Use whenever the user asks for an architecture diagram, system design visual, LLD, request flow, sequence diagram, data pipeline, CI/CD flow, state machine, or asks to iterate on one ("add Redis", "animate the queue path").
---

# ai-archi — animated architecture & LLD diagrams

Turn a plain-English description of a system or process into a polished,
**animated**, self-contained HTML diagram. One file, zero dependencies, share by
sending it.

## Workflow

1. **Classify** the request into a diagram type (see `references/diagram-types.md`):
   `architecture` · `lld` (class/module internals) · `sequence` · `workflow`
   (approvals, CI/CD, runbooks) · `data-flow` (pipelines, PII boundaries) ·
   `lifecycle` (state machines).
2. **Plan the layout on paper first** (in your head / a scratch note): columns =
   tiers, rows = peers. Assign every node an `(x, y)` on the grid **before**
   writing SVG. Default node is 168×56 with ≥ 70 px horizontal and ≥ 24 px
   vertical gaps between boxes.
3. **Copy `templates/diagram.html`** to the output location (name it after the
   system, e.g. `checkout-architecture.html`). Then edit ONLY these regions:
   - `<title>` and the `.brand` h1/p in the toolbar
   - everything between `<!-- ==== DIAGRAM ==== -->` and `<!-- ==== END DIAGRAM ==== -->`
     (the `<svg id="diagram">` — keep the id, `viewBox`, `defs`, and the
     `.dg-bg` rect sized to the viewBox)
   - optionally the category colors in `#theme-vars` (keep the two-rule
     light/dark structure — the exporter parses it)

   **Never edit the `<script>` runtime or `#ui-style`** — they are generic.
4. **Validate**: `node scripts/validate.mjs <output.html>` — fixes anything it
   flags, re-run until PASS.
5. **Report**: tell the user the file path, suggest `open <file>`, and mention
   the toolbar (theme toggle, motion pause, step player, Copy PNG, export).

## Building the SVG

### Canvas
- `viewBox="0 0 W H"` — pick W 900–1600, H to fit content + 30 px margins.
- First child after `<defs>`: `<rect class="dg-bg" width="W" height="H"/>`.
- Title block: `.dg-title` at (40, 46), one-line `.dg-sub` at (40, 66).

### Nodes
```svg
<g class="node cat-compute" transform="translate(X Y)" style="--d:.2s"><g class="node-in">
  <rect class="node-box" width="168" height="56" rx="13"/>
  <rect class="node-chip" x="10" y="12" width="32" height="32" rx="9"/>
  <use class="node-icon" href="#i-compute" x="14" y="16" width="24" height="24"/>
  <text class="node-title" x="52" y="26">App Service</text>
  <text class="node-sub" x="52" y="42">node.js · k8s</text>
</g></g>
```
- Category classes (pick by semantic label, see `references/tech-labels.md`):
  `cat-client` `cat-gateway` `cat-compute` `cat-storage` `cat-queue`
  `cat-external` `cat-security` `cat-observe`.
- **Icons** — the template's `defs` ship the 8 category glyphs. For specific
  technologies, pull sharper glyphs from the asset libraries
  (`assets/INDEX.md` has the full catalog — 46 icons across core/tech/shapes):
  ```bash
  node scripts/icons.mjs grep vector          # find the id
  node scripts/icons.mjs pick i-vector-db i-llm   # print defs-ready markup
  ```
  Paste the printed `<symbol>`s into `defs`, reference with
  `<use class="node-icon" href="#i-vector-db" …>`. Inline only symbols the
  diagram actually uses (self-containment). The category class still sets the
  color; the icon just gets more specific. Only invent a new symbol when no
  library icon fits — 24×24, stroke `currentColor`, width 1.7 — and consider
  contributing it back to `assets/`.
- `--d` is the entrance-animation delay: stagger nodes .05 s–.8 s
  left-to-right / top-to-bottom.
- Anchors of a node at (X, Y): left `(X, Y+28)`, right `(X+168, Y+28)`,
  top `(X+84, Y)`, bottom `(X+84, Y+56)`. Fan multiple edges on one side by
  offsetting ±14 px around the midpoint.

### Zones (VPCs, trust boundaries, PII boundaries)
```svg
<g class="zone" style="--d:.05s">
  <rect class="zone-box" x=".." y=".." width=".." height=".." rx="16"/>
  <text class="zone-title" x="+16" y="+22">APPLICATION VPC</text>
</g>
```
Place zones before edges/nodes. Pad 20–24 px around contained nodes; leave
28 px headroom for the title so it doesn't collide with the first node.

### Edges
```svg
<g class="edge-g cat-storage" data-step="4" style="--d:.7s">
  <path id="e4" class="edge" d="M708 254 H758 Q762 254 762 250 V192 Q762 188 766 188 H812" marker-end="url(#arrow)"/>
  <path class="edge-flow" d="...same d..."/>
  <text class="edge-label" x=".." y=".." text-anchor="middle">sql</text>
  <circle class="packet" r="3.4"><animateMotion dur="2s" repeatCount="indefinite"><mpath href="#e4"/></animateMotion></circle>
</g>
```
- Orthogonal paths only (`H`/`V` segments); round every corner with a 4 px
  `Q` curve as above. Stop the path ~4 px short of the target box so the
  arrowhead doesn't pierce it.
- The wrapper's `cat-*` class colors the flow overlay and packet.
- Dashed/advisory links (metrics, traces, fallback): add class `dotted` to the
  `.edge` path and omit the flow overlay.

### Animation (three layers — use deliberately, not everywhere)
1. **Entrance** — automatic via `--d` stagger on `.node`, `.edge-g`, `.zone`.
2. **Flow** — `.edge-flow` overlay (marching dashes) + optional `.packet`
   (dot traveling the path via `animateMotion` + `mpath href="#edgeId"`;
   desync packets with `begin="0.5s"` etc.). Animate the *primary* path
   through the system, not every edge. Packets: 2–4 per diagram max.
3. **Step player** — add `data-step="N"` (contiguous, starting at 1) to the
   `.edge-g` (or any `<g>`) groups that form the narrated flow. The toolbar
   auto-shows ‹ ▶ › controls; non-step elements stay visible, done steps dim,
   the current step highlights. Perfect for sequence diagrams and runbooks.

Everything animated must look correct when frozen: the exporter strips
animations, so final states are the resting states (never rely on an animation
to move something into position).

## Iterating by chat
"add Redis", "move auth left", "use emerald for the API" → edit only the SVG
region (and `#theme-vars` for palette asks) of the *existing* file, keep ids
stable, re-run the validator. Never regenerate the whole file from scratch for
an incremental request.

## Rules
- Self-contained: no external URLs, fonts, scripts, or images. System font
  stack only.
- Every text element must have ≥ 8 px clearance from box borders and other
  text; when a label would collide with an edge, the halo (`paint-order`)
  handles crossings, but prefer moving the label.
- Keep it legible: ≤ ~16 nodes per diagram. More than that → split into an
  overview + detail diagrams (separate files).
- Real tech names in `.node-sub` (semantic labels: `s3 · artifacts`,
  `kafka`, `github-actions`), product-neutral role names in `.node-title`.
