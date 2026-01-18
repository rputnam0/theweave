## PR Spec: JS → Boxes-Rendered ASCII Borders With Exact Layout Parity

### 1) Objective

Implement an **ASCII Border Rendering System** that lets frontend engineers write **standard React + TSX + Tailwind** layout code (padding, size, placement) while a helper layer:

1. **Converts layout intent** (size/padding/alignment/position) into **character-cell constraints** (cols/rows).
2. Calls your existing **`boxes` container API** to render the selected design and returns the final ASCII.
3. Ensures the **rendered DOM footprint** matches the **ASCII output footprint exactly** (character-perfect borders, deterministic sizing).

**Success criterion (hard requirement):** For every rendered box, the **DOM box’s measured character-grid footprint** (cols × rows, including padding and border) **matches** the **ASCII output’s cols × rows exactly**, and the displayed text matches byte-for-byte (excluding configured line-ending normalization). If a design cannot satisfy the requested size, the DOM must **snap to the measured output** rather than forcing an inaccurate layout.

This spec is designed around the `boxes` tool’s capabilities:

* `-p/--padding` accepts per-side padding in spaces. ([boxes][1])
* `-s/--size` accepts desired box size in **columns × lines**, noting actual size may vary by design and other options. ([boxes][1])
* `boxes` supports many designs (including Unicode) and is “elastic” around content. ([boxes][2])

---

### 2) Non-Goals

* Reimplement `boxes` design logic in TypeScript.
* Guarantee pixel-perfect parity with arbitrary fonts and CSS; instead, enforce a **character-cell contract** and **snap** layout to that grid.
* Solve general HTML/CSS layout-to-text rendering for arbitrary DOM; this system is for **explicit ASCII box primitives**.

---

### 3) Glossary

* **Cell**: One character column by one text line (monospace grid unit).
* **Cols/Rows**: Width/height in cells.
* **Outer size**: Total cols/rows including border + padding + content area.
* **Inner content block**: The text block inside padding.
* **Snap**: Converting px/em/rem/etc. into integer cols/rows using measured cell metrics.

---

### 4) System Overview

#### 4.1 Components

1. **`BoxesAPIClient`** (frontend utility): Calls your container API to render ASCII.

2. **`AsciiBox` React component** (frontend primitive):

   * Accepts “normal” layout props (width/height/padding) via CSS/Tailwind or numeric style values.
   * Measures and snaps to integer cols/rows.
   * Requests final ASCII from the container.
   * Renders ASCII into `<pre>` and sets its CSS size to match ASCII dimensions.

3. **`AsciiCanvas` (optional advanced)**: Composes multiple boxes into a single ASCII “screen” by row/col placement (for cases where “location on webpage” must be reflected in a single ASCII plane).

#### 4.2 Rendering Contract

A rendered `AsciiBox` is defined by:

* `design`: `boxes -d <name>`
* `padding`: `boxes -p <spec>` in spaces (per-side supported). ([boxes][1])
* `size`: `boxes -s <cols>x<rows>` (outer size target). ([boxes][1])
* `align`: `boxes -a <format>` for text block alignment/justification. ([boxes][1])
* normalized input content (tabs/newlines/wide chars policy).

Because `-s` may not produce the requested size depending on the design, the implementation must measure the ASCII output and **iterate** to reach an exact cols/rows match (or intentionally snap the DOM to the produced size if exact cannot be achieved for that design). ([boxes][1])

---

### 5) Frontend API & Developer Experience

#### 5.1 `AsciiBox` Component API (TS)

```ts
type AsciiBoxAlign =
  | 'l' | 'c' | 'r'
  | `h${'l'|'c'|'r'}`
  | `v${'t'|'c'|'b'}`
  | `j${'l'|'c'|'r'}`
  | string; // pass-through for boxes -a format

type CssLength = number | string; // number treated as px

type AsciiBoxProps = {
  design: string;                 // boxes -d
  children?: string;              // content text (or use content prop)
  content?: string;

  // Standard layout intent:
  width?: CssLength;              // e.g. 480, '32rem', '60ch'
  height?: CssLength;             // optional; if omitted, height auto based on content
  padding?: CssLength;            // shorthand
  paddingX?: CssLength;
  paddingY?: CssLength;
  paddingTop?: CssLength;
  paddingRight?: CssLength;
  paddingBottom?: CssLength;
  paddingLeft?: CssLength;

  // Text & box rules:
  align?: AsciiBoxAlign;          // boxes -a
  tabs?: number;                  // maps to boxes -t (default 8) :contentReference[oaicite:7]{index=7}
  wrap?: 'off' | 'hard' | 'word'; // content handling policy
  overflow?: 'clip' | 'ellipsis'; // if hard bounded

  // Location:
  x?: CssLength;                  // used by AsciiCanvas / absolute positioning
  y?: CssLength;

  // Rendering:
  apiBaseUrl?: string;            // override env
  debounceMs?: number;            // resize debounce
  debug?: boolean;                // show cols/rows overlay in dev
};
```

**Frontend engineer workflow**:

* Use `<AsciiBox design="nuke" className="..." style={{ width: 420, padding: 16 }} />`
* No manual column math; snapping + iteration ensures ASCII matches final footprint.

#### 5.2 Tailwind and CSS Requirements

Add an “ASCII grid baseline” style applied to ASCII regions:

* `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
* `white-space: pre;` (or Tailwind `whitespace-pre`)
* `line-height` fixed and consistent (Tailwind `leading-none` or a controlled value)
* `letter-spacing: 0;`
* `font-variant-ligatures: none;` (prevents glyph substitution that can affect perceived width)

This is mandatory to preserve 1 cell = 1 glyph column. The `AsciiBox` component should apply these rules directly if the surrounding CSS does not guarantee them.

---

### 6) Measurement & Snapping: Converting “Normal CSS” to Cells

#### 6.1 Cell Metric Measurement

Provide `useAsciiCellMetrics()`:

* Creates a hidden measurement element inside the same font context as the box:

  * Measure a **glyph set** and use the **maximum width** as `charWidthPx` to account for glyph variance (e.g. `-`, `*`, `#`, Unicode box chars).
  * Measures a single line height → `lineHeightPx`
* Stores metrics in context so all boxes in the region share consistent snapping.

#### 6.2 Snapping Rules (Deterministic)

For any CSS length in px:

* `cols = clamp(minCols, maxCols, round(widthPx / charWidthPx))`
* `rows = clamp(minRows, maxRows, round(heightPx / lineHeightPx))`

Padding per side:

* `padLeftCols  = round(padLeftPx / charWidthPx)`
* `padTopRows   = round(padTopPx / lineHeightPx)`
  …and similarly for right/bottom.

**Rounding mode:** default `round()` (nearest). In dev, warn if any conversion has >0.25 cell fractional remainder (indicates likely mismatch risk if user expects exact px sizing).

#### 6.3 Resize Handling

Use `ResizeObserver` on the container element:

* On size changes, recompute cols/rows, then rerender ASCII.
* Debounce to avoid thrashing (default 50–100ms).

---

### 7) Boxes Container API Contract

You said you already call `boxes` “as an API”. This PR standardizes request/response so the frontend helper can be stable.

#### 7.1 Endpoints

1. `GET /api/designs` (optional)

* Returns list of design names and (optional) metadata (aliases, tags).

2. `POST /api/box`

* Renders ASCII using `boxes`.

#### 7.2 `POST /api/box` Request

```json
{
  "design": "nuke",
  "cols": 60,
  "rows": 10,
  "pad": 2,
  "padRows": 1,
  "align": "hlvt",
  "tabs": 8,
  "eol": "LF",
  "text": "Hello\nWorld"
}
```

Mapping to `boxes` args:

* `-d design` ([boxes][1])
* `-s {cols}x{rows}` ([boxes][1])
* `-p` derived string like `t1r2b1l2` ([boxes][1])
* `-a align` ([boxes][1])
* `-t tabs` (and chosen behavior, see §8.2) ([boxes][1])
* `-e LF` to normalize newlines ([boxes][1])

#### 7.3 Response

```json
{
  "boxText": "....\n....\n",
  "measured": { "cols": 62, "rows": 11 },
  "requestId": "hash-or-guid",
  "warnings": ["Actual size differs from requested size for this design."]
}
```

The `measured` dims are computed server-side from the returned ASCII (max display width per line, number of lines), using the same width rules as the client.

---

### 8) Exact-Match Guarantee: Iterative Size Solver

Because `boxes -s` may not produce the requested size for some designs (shape constraints, padding interactions). ([boxes][1])

#### 8.1 Solver Responsibilities

Given **target outer** `(targetCols, targetRows)`:

1. Call `/render` with initial `-s targetCols x targetRows`.
2. Measure output dims `(outCols, outRows)`.
3. If exact: done.
4. Else: adjust requested size and retry up to N iterations (N=5 default), using monotonic assumptions:

   * `nextCols = targetCols + (targetCols - outCols)`
   * `nextRows = targetRows + (targetRows - outRows)`
   * Clamp to bounds.

If still not exact after N:

* Return best effort ASCII and measured dims.
* **Client must snap DOM size to `measured` dims** to maintain “ASCII == DOM footprint” success criterion (even if the author asked for a size the design cannot realize exactly).

This preserves the hard success criterion (visual and measured parity) at the expense of exact requested px size, which is unavoidable for some designs.

**DOM snapping rule:** The frontend must size the `<pre>` to `measured.cols` × `measured.rows` whenever the server reports a mismatch, even if the author requested a different px size.

---

### 9) Content Normalization & Width Semantics (Edge-Case Critical)

#### 9.1 Newlines & EOL

* Client normalizes input to `\n`.
* Server forces `-e LF` so output is consistent across platforms. ([boxes][1])

#### 9.2 Tabs

`boxes` has explicit tab handling semantics. ([boxes][1])

Policy:

* Default `tabs=8`, expand tabs to spaces before rendering for deterministic layout.
* Disallow literal `\t` in content unless explicitly enabled; otherwise replace with spaces.

#### 9.3 Unicode Display Width

Some content characters are not 1-column wide (CJK, emoji), and combining marks can break naive `.length`.

Requirement:

* Implement `displayWidth()` consistent across client/server:

  * Use a well-defined wcwidth strategy (or a library) to compute terminal-style width.
  * Count combining marks as 0, wide glyphs as 2.
* Use this for:

  * Measuring ASCII output dimensions (`measured.cols`)
  * Wrapping/truncation behavior

If your designs are Unicode-heavy, this is mandatory because the site advertises UTF-8 support. ([boxes][2])

#### 9.4 Trailing Spaces

HTML can visually preserve them in `<pre>`, but any transformation must not trim. Enforce:

* Render in `<pre className="whitespace-pre font-mono">`
* Never `.trimEnd()` any lines.

**Measured width rule:** Server-side `measured.cols` should be computed from rendered ASCII line display width. For ASCII-only designs, line length is sufficient; for Unicode designs, use `displayWidth()` to avoid mismatches.

---

### 10) Location on Webpage

Two supported modes:

#### 10.1 DOM Layout Mode (default)

Each `AsciiBox` is a normal DOM element; location is handled via CSS (flex/grid/absolute). The helper ensures **the element size matches the ASCII**, not that the ASCII encodes absolute positioning.

#### 10.2 ASCII Canvas Mode (optional, but specified for completeness)

For “single-text-surface” pages:

* `AsciiCanvas` maintains a 2D grid `(canvasCols × canvasRows)`.
* Child boxes provide `(x,y)` in cells (snapped from CSS lengths).
* Canvas compositor writes each box’s ASCII into the grid.
* Overlap policy options:

  * `zIndex` ordering
  * “transparent space” rules: spaces do not overwrite existing glyphs (optional)

This is where “location” is reflected in the ASCII itself.

---

### 11) Failure Modes & Mitigations

1. **Font not monospace / inconsistent line-height**

* Detect via measurement drift (e.g., width(100 chars) / 100 varies by sample).
* In dev: hard error with fix instructions.
* In prod: fall back to a safe default (render without attempting size constraints).

2. **Design cannot satisfy exact size**

* Solver iterates; if impossible, snap DOM to measured dims and emit warning.

3. **API latency**

* Cache responses by hash of request payload.
* Use optimistic rendering: show previous ASCII until new arrives.

4. **Resize thrashing**

* Debounce + request cancellation.
* Only rerender when snapped cols/rows changed (ignore tiny px changes that snap to same integer).

5. **Very small boxes**

* Define minimum `(cols, rows)` per design attempt. If too small, either:

  * grow to minimum and warn, or
  * refuse render and show placeholder.

6. **Untrusted inputs**

* Server must whitelist:

  * `design` names from `/designs`
  * max cols/rows (e.g., 400×200)
  * max content bytes
* Prevent command injection by never shell-concatenating raw strings.

---

### 12) Implementation Plan (PR Breakdown)

#### 12.1 New Files (Frontend)

* `src/components/ui/ascii/types.ts`
* `src/components/ui/ascii/measure.ts` (cell metrics + snapping)
* `src/components/ui/ascii/displayWidth.ts` (wcwidth)
* `src/components/ui/ascii/boxesClient.ts` (fetch, caching, abort)
* `src/components/ui/AsciiBox.tsx` (main component)
* `src/components/ui/AsciiCanvas.tsx` (optional advanced)
* `src/components/ui/ascii/__tests__/...` (unit tests)

#### 12.2 Styles

* `src/styles/ascii.css` (or integrate into `src/index.css`)

  * `.ascii-root` baseline monospace + whitespace rules
  * optional debug grid overlay

#### 12.3 Environment

* `.env` key: `VITE_BOXES_API_BASE_URL`

#### 12.4 Example / Demo

* Add a demo route/component under `src/components/` to showcase:

  * multiple designs
  * resizing
  * padding variants
  * unicode content

---

### 13) Testing Strategy (Enforces the “Exact Match” Requirement)

#### 13.1 Unit Tests

* `displayWidth()` with:

  * ASCII, combining marks, CJK, emoji
* Padding conversion (px → cols/rows) deterministic
* Solver convergence with mocked responses (designs that offset size)

#### 13.2 Integration Tests (API Contract)

* Mock `POST /api/box` returning known ASCII
* Assert `AsciiBox` renders exactly that string (byte-for-byte)
* Assert DOM style width/height derived from measured dims

#### 13.3 E2E Tests (Playwright)

For a set of designs:

* Render `<AsciiBox width=... padding=... />`
* Read `.innerText` from `<pre>` and compare to API response.
* Verify computed cols/rows from DOM match `measured` exactly.
* Resize viewport; ensure rerender happens only when snapped dims change.

---

### 14) Acceptance Criteria Checklist

**Functional**

* [ ] Frontend engineer can specify `design` + normal sizing/padding without manual column math.
* [ ] System renders boxes using container API and shows ASCII in the DOM.
* [ ] For every box: `measured.cols/rows` equals computed DOM cols/rows exactly.
* [ ] DOM snaps to `measured.cols/rows` whenever a design cannot satisfy requested size.
* [ ] Supports per-side padding via `boxes -p`. ([boxes][1])
* [ ] Uses `boxes -s` and handles design variance via solver/snapping. ([boxes][1])

**Robustness**

* [ ] ResizeObserver-based reflow without thrash.
* [ ] Handles Unicode width correctly.
* [ ] Safe bounds and input validation.

**DX**

* [ ] `GET /api/designs` populates valid `design` options (optionally used to generate TS types).
* [ ] Clear dev warnings when author intent cannot be represented exactly.

---

### 15) Open Decisions (Documented Defaults)

These must be finalized in the PR description and codified as constants:

1. Rounding mode for px→cell: `round` vs `floor/ceil`
2. Max solver iterations: default 5
3. Bounds: max cols/rows/content bytes
4. Wrap policy default: `hard` or `off`
5. Overlap policy for `AsciiCanvas`

---

### 16) Defaults (Resolved for This Codebase)

1. **API shape:** `/api/box` with response `{ boxText, measured }`. This matches the existing renderer and minimizes glue code for frontend engineers.
2. **Sizing inputs:** Accept CSS lengths (`px`, `rem`, `em`) **and** `ch`/`lh` for exact column/row sizing. This is the most useful option for frontend engineers because it enables precise grid sizes without manual conversion.
3. **Layout mode:** DOM Layout Mode only for v1. `AsciiCanvas` is deferred.
4. **Measurement glyph set:** Use a fixed set that includes ASCII and common box‑drawing glyphs, e.g. `*-/\\_|~+=#╭╮╰╯┌┐└┘─│═║`.



[1]: https://boxes.thomasjensen.com/boxes-man-1.html "Manpage of boxes(1) - boxes"
[2]: https://boxes.thomasjensen.com/ "boxes - Command line ASCII boxes unlimited!"
