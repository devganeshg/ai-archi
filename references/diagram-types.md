# Diagram-type recipes

All types reuse the same template runtime, node/edge/zone classes, and export
pipeline. Only the SVG composition changes. Coordinates below assume the
default 168×56 node; scale as needed.

## 1. Architecture (system / HLD)

The template's built-in demo IS this recipe. Columns = tiers
(clients → edge → services → data / external), left-to-right request flow.
- Group with zones: VPCs, regions, trust boundaries.
- Animate (flow + packets) only the primary request path; give it `data-step`
  numbers so the step player narrates it.
- Cross-cutting concerns (observability, auth checks) as `dotted` edges.

## 2. LLD (class / module internals)

Nodes become **detail cards**: wider (200–240), taller, with a divider and
member rows. Same `.node` wrapper so entrance animation and theming work:

```svg
<g class="node cat-compute" transform="translate(X Y)" style="--d:.2s"><g class="node-in">
  <rect class="node-box" width="220" height="118" rx="13"/>
  <rect class="node-chip" x="10" y="12" width="26" height="26" rx="8"/>
  <use class="node-icon" href="#i-compute" x="13" y="15" width="20" height="20"/>
  <text class="node-title" x="46" y="29">OrderService</text>
  <path d="M12 48 H208" stroke="var(--line)" stroke-opacity=".4" stroke-width="1"/>
  <text class="node-sub" x="16" y="66">- repo: OrderRepository</text>
  <text class="node-sub" x="16" y="82">+ create(dto): Order</text>
  <text class="node-sub" x="16" y="98">+ cancel(id): void</text>
</g></g>
```
- Member rows: `.node-sub`, 16 px line pitch, `-` private / `+` public.
- Relations: solid arrow = calls/depends; `dotted` = implements/imports;
  label the edge (`implements`, `1..*`, `emits`).
- For an interface, use `cat-external` tint and a `«interface»` first row.

## 3. Sequence

Vertical lifelines, time flows downward, messages are horizontal stepped edges.

Layout math for N participants, M messages:
- Participant heads: standard nodes at `x = 60 + i*220`, `y = 90`.
- Lifeline (per participant, right after zones):
  `<path class="edge dotted" d="M {x+84} 146 V {H-40}"/>` (no marker).
- Activation bar while a participant is busy:
  `<rect x="{x+78}" y=".." width="12" height=".." rx="3" fill="var(--cs)" stroke="var(--c)" stroke-opacity=".5"/>`
  inside a `<g class="cat-...">`.
- Message k (top to bottom, 46 px pitch, starting y=190):
```svg
<g class="edge-g cat-compute" data-step="k" style="--d:.4s">
  <path id="m3" class="edge" d="M {fromX+90} {y} H {toX+78}" marker-end="url(#arrow)"/>
  <path class="edge-flow" d="M {fromX+90} {y} H {toX+78}"/>
  <text class="edge-label" x="{midX}" y="{y-7}" text-anchor="middle">POST /orders</text>
</g>
```
- Replies: `dotted` edge, label like `200 OK`, still gets its `data-step`.
- Self-call: `M x y H x+34 Q x+38 y x+38 y+4 V y+18 Q x+38 y+22 x+34 y+22 H x`.
- **Give every message a `data-step`** — the step player is the killer feature
  here (auto-play walks the call chain).

## 4. Workflow (approvals, CI/CD, runbooks)

Left-to-right (or top-down) stages; decisions are diamonds:

```svg
<g class="node cat-gateway" transform="translate(X Y)" style="--d:.3s"><g class="node-in">
  <path class="node-box" d="M60 0 L120 34 L60 68 L0 34 Z"/>
  <text class="node-title" x="60" y="30" text-anchor="middle">tests</text>
  <text class="node-sub" x="60" y="45" text-anchor="middle">pass?</text>
</g></g>
```
- Diamond anchors: right `(X+120, Y+34)`, bottom `(X+60, Y+68)`.
- Label branch edges `yes` / `no`; route the failure branch downward to a
  `cat-security`-tinted stage (rollback, page on-call).
- Swimlanes = horizontal zones (one per actor/team), stages step through them.
- `data-step` on the happy path; CI/CD stage nodes use `cat-compute`,
  approvals `cat-security`, deploy targets `cat-external` or `cat-compute`.

## 5. Data-flow (pipelines, PII boundaries)

Architecture layout, but edges are the star:
- Thicken primary data edges: add `style="stroke-width:2.2"` to `.edge`.
- Every edge label names the payload (`events 30k/s`, `parquet`, `PII: email`).
- PII boundary = a zone with `cat-security` accent:
  `<rect class="zone-box" style="stroke:var(--cat-security);stroke-opacity:.7"/>`
  and zone-title `PII BOUNDARY`; edges crossing it get a `redact` /
  `tokenize` label.
- Flow overlays on every mainline hop (this is the one type where animating
  most edges is right — it reads as data moving through the pipe).

## 6. Lifecycle (state machines)

States are pill nodes on a ring or ladder:
```svg
<g class="node cat-compute" transform="translate(X Y)" style="--d:.2s"><g class="node-in">
  <rect class="node-box" width="140" height="44" rx="22"/>
  <text class="node-title" x="70" y="27" text-anchor="middle">PROVISIONING</text>
</g></g>
```
- Initial state: small filled circle `<circle r="7" fill="var(--ink)"/>` with an
  edge into the first state. Terminal: double circle.
- Transitions: curved paths `M .. Q .. ..` with the triggering event as the
  edge label (`payment_confirmed`, `ttl_expired`).
- Color by health: normal `cat-compute`, success/terminal `cat-observe`,
  error states `cat-security`.
- `data-step` along the happy-path lifecycle; error transitions `dotted`.

## Shared polish checklist
- Nothing overlaps; labels have breathing room; arrowheads stop short of boxes.
- Entrance delays follow reading order (flow direction).
- Dark AND light both checked (toggle before shipping).
- Step numbers contiguous from 1; frozen (exported) frame looks complete.
