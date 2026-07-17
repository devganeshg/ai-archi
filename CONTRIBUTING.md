# Contributing to ai-archi

Thanks for helping make ai-archi better! It's a small project with a simple
shape — most contributions land in one of four places.

## Where things live

| Change | File(s) |
|---|---|
| Visual style, runtime behavior (export, theme, step player) | `templates/diagram.html` |
| How the agent plans and builds diagrams | `SKILL.md` |
| New diagram-type recipes or layout patterns | `references/diagram-types.md` |
| New semantic tech labels | `references/tech-labels.md` |
| New icons / icon libraries | `assets/*.svg` + catalog in `assets/INDEX.md` (brand-neutral only — no real logomarks) |
| Validation checks | `scripts/validate.mjs` |

## Ground rules

1. **Generated files must stay self-contained.** No CDNs, webfonts, external
   images, or fetch calls — ever. The validator enforces this.
2. **The runtime is generic.** The `<script>` block and `#ui-style` in the
   template must work for any diagram without per-diagram edits.
3. **Resting states are final states.** Exports strip animations, so a frozen
   diagram must look complete (animate opacity/dashes, never positions).
4. **Keep the two-rule theme block.** The exporter parses `#theme-vars`
   expecting exactly `[data-theme="light"]` and `[data-theme="dark"]`.

## Testing a change

```bash
node scripts/validate.mjs templates/diagram.html   # must PASS
open templates/diagram.html                        # then check by hand:
```

- toggle dark/light — both themes legible
- pause/resume motion; play the step player end to end
- Copy PNG → paste somewhere
- export PNG @4× (crisp?), and SVG (open it, flip your OS color scheme)

## Pull requests

- Small and focused beats big and mixed.
- If you change the template's markup contract (class names, required ids,
  structure), update `SKILL.md` and the validator in the same PR.
- New tech labels: add them to the table in `references/tech-labels.md`
  alphabetically within their category, with a note if context-dependent.

## Reporting bugs

Open an issue with: the diagram HTML (or a minimal snippet), browser + OS,
what you expected, what happened. Export bugs: include format, scale, theme.
