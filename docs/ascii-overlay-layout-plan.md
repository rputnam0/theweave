# ASCII Overlay Layout Plan (Boxes Config as Source of Truth)

## Goal
Make sure any rich HTML overlay (titles, links, buttons, etc.) can sit inside an ASCII box without the border overlapping the text. The overlay should be positioned based on the same rules that the `boxes` CLI uses to place text inside a box.

## Why the current approach fails
We currently try to infer the “inner content rectangle” by scanning the rendered ASCII art. That works for simple borders but fails on designs that have **decorative glyph bands inside the frame** (scrolls, speech bubbles, signs, etc.). Those glyphs are *inside* the frame, so the heuristic thinks they’re valid content rows and the overlay ends up too close to the border.

The `boxes` project already defines where text belongs:
- The **shape widths/heights** define border thickness on each side.
- The **padding block** defines the empty space between the border and text.
- The **align option** defines where the text block sits inside the padded area.

So instead of guessing from output, we should compute the content area directly from the config.

---

## Source of Truth: Boxes Config
Use `boxes/boxes/boxes-config` as the authoritative definition of layout.

Key rules from docs:
- The “padding area” is where text is placed.
- Shapes on each side have consistent width/height.
- “Open” sides are shapes that are all spaces.
- Alignment (`-a`) positions the text block inside the padding area.

Docs references:
- `boxes_docs/Config Intro boxes.md` (padding area and shape layout diagram)
- `boxes_docs/Config File Syntax boxes.md` (shapes, padding syntax)

---

## Concrete Plan (Step-by-Step for Implementation)

### 1) Add a layout extraction script (offline build step)
Create a script (ex: `scripts/extract-box-layout.mjs`) similar to the existing:
- `scripts/extract-box-glyphs.mjs`
- `scripts/extract-box-samples.mjs`

The script reads `boxes/boxes/boxes-config` and outputs:
`src/components/ui/ascii/designLayout.json`

### 2) Parse the config correctly
Requirements for the parser:
- Support `BOX name[, alias...]`
- Support `shapes { ... }` block
- Support `padding { ... }` block
- Support `delim` / `delimiter` directives (string delimiter + escape char change)
- Do **not** trim shape lines; trailing spaces are meaningful
- Ignore comments (`#`) only when they’re not inside a string

Parsing shape strings:
- Extract the raw string contents from the configured delimiter
- Unescape using the current escape char
- Keep spaces intact

### 3) Compute border thickness per side
For each design:
- Collect shape lines for each side:
  - Left: `NW`, `WNW`, `W`, `WSW`, `SW`
  - Right: `NE`, `ENE`, `E`, `ESE`, `SE`
  - Top: `NW`, `NNW`, `N`, `NNE`, `NE`
  - Bottom: `SW`, `SSW`, `S`, `SSE`, `SE`

For each shape:
- Width = max display width of its lines
- Height = number of lines in the shape
- Strip ANSI color escape sequences before measuring
- Use `displayWidth()` for Unicode width, not `string.length`

Determine border thickness:
- `borderLeft` = max width of left shapes
- `borderRight` = max width of right shapes
- `borderTop` = max height of top shapes
- `borderBottom` = max height of bottom shapes

Handle open sides:
- If all lines in a side are spaces, treat that side as open with thickness 0.

### 4) Compute default padding per side
Parse the `padding { ... }` block:
- Start at 0 for all sides
- Apply entries in order
- Supported entries:
  - `all`, `horizontal`, `vertical`, `top`, `bottom`, `left`, `right`

Example:
```
padding {
  vertical 2
  left 4
}
```
Results in: top=2, bottom=2, left=4, right=0

### 5) Output design layout JSON
For each design name (including aliases), write:
```json
{
  "design-name": {
    "border": { "top": 2, "right": 9, "bottom": 1, "left": 9 },
    "padding": { "top": 0, "right": 1, "bottom": 0, "left": 1 },
    "contentInset": { "top": 2, "right": 10, "bottom": 1, "left": 10 }
  }
}
```

Notes:
- `contentInset = border + padding` (per side)
- Include aliases so lookup works for all names

### 6) Use layout metadata in AsciiBox
In `src/components/ui/AsciiBox.tsx`:
- Load `designLayout.json`
- Determine `usedPadding`:
  - If user specified padding props -> use those
  - Else fall back to design default padding from JSON
- Compute content inset in **cells**:
  - `insetLeft = borderLeft + usedPadding.left`
  - `insetRight = borderRight + usedPadding.right`
  - `insetTop = borderTop + usedPadding.top`
  - `insetBottom = borderBottom + usedPadding.bottom`
- Convert to px using current font metrics and `resolvedFit` scaling
- Apply that as overlay padding (CSS `padding` on `.ascii-overlay`)

### 7) Ensure box size accounts for overlay content
When the overlay is larger than the current box:
- Convert overlay px size -> content area cells
  - `contentCols = ceil(overlayWidth / charAdvancePx)`
  - `contentRows = ceil(overlayHeight / lineHeightPx)`
- Compute total box size in cells:
  - `cols = contentCols + insetLeft + insetRight`
  - `rows = contentRows + insetTop + insetBottom`
- Use these when computing layout/sizing so the solver gets the correct full size.

Important:
The solver uses the padding you send. So we must send **exactly** the padding we use for overlay placement (explicit or default).

### 8) Fallback only when config is missing
If a design is not in `designLayout.json`, fall back to the current heuristic `detectInnerBounds()`. That keeps legacy behavior for custom or unknown designs.

### 9) Update tests
Add/extend tests to verify:
- Extracted border thickness for `scroll-akn` and `parchment` matches config expectations.
- Content inset excludes inner decorative bands (no overlap).
- Overlay padding is at least `border + padding` for those designs.
- Regression check for simple boxes (single-glyph borders).

### 10) Visual verification
Update the ASCII demo page to include overlay text blocks and visually confirm:
- No overlay text overlaps borders
- Scroll and parchment styles are clean
- Boxes of different sizes still align correctly

---

## Why this will solve the overlay overlap
- The overlay padding will be derived from the same rules used by `boxes` itself.
- Decorative interior glyphs no longer trick the algorithm.
- Per-design shape thickness is handled exactly, not guessed.

This makes the overlay robust across all 72 box types and aligns with the intended layout of the original ASCII art.
