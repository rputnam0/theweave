# AsciiBox Overlay Overflow Fix Plan

## Summary (Problem Statement)
Overlay text can spill below the ASCII border in boxes like `scroll` and `parchment`. This is visible in the overview recap/quote cards and the demo grid: the border renders, but text extends outside the bottom edge.

## Root Cause (Why This Happens)
The overlay layout and the ASCII layout are computed using the **box config metadata**, but the **container size is not**.

Specifically:
- We measure overlay content size via `.ascii-overlay-content` (height/width in px).
- We compute box rows/cols using **design metadata** (border thickness + padding) so the ASCII box *should* be large enough.
- However, the `.ascii-root` container is only given `minHeight/minWidth` based on the **overlay content size** (not content + inset).
- Because `.ascii-pre` is absolutely positioned and **scaled to fit the container**, the ASCII border is squeezed into the smaller container size.
- The overlay container then applies padding (border + padding) **inside** this smaller box, so the remaining content area is too small and text spills past the bottom.

In short: **layout uses design config but container size does not**, so the box is sized to content-only instead of content + inset.

## Fix Strategy (High Level)
Use the extracted box metadata (`designLayout.json`) to size the container **including** the border + padding inset. The container must be at least:

```
contentSize + (borderThickness + padding) on each side
```

This makes the ASCII border and the overlay padding agree, so content sits inside the frame.

## Concrete Steps (For a Junior Dev)
1. **Locate the sizing logic**
   - File: `src/components/ui/AsciiBox.tsx`
   - Look for `boxStyle` and the `minHeight/minWidth` logic.
   - Notice it currently uses `overlaySize` only.

2. **Compute overlay inset in pixels using box config**
   - Use `layoutMeta.border` and `layout.padding` (already derived from config).
   - Convert those values from cell counts to pixels:
     - Horizontal inset: `(border.left + padding.left + border.right + padding.right) * charAdvancePx`
     - Vertical inset: `(border.top + padding.top + border.bottom + padding.bottom) * lineHeightPx`
   - This must use the same metrics as the ASCII solver.

3. **Set container min size using overlay content + inset**
   - If overlay is present and no explicit width/height is provided:
     - `minWidth = overlayContentWidth + insetWidth`
     - `minHeight = overlayContentHeight + insetHeight`
   - This ensures the container can fit the overlay + padding + border.

4. **Keep design config as source of truth**
   - Do not hardcode padding/border.
   - Always use `designLayout.json` (via `layoutMeta`) when calculating inset.

5. **Verify in the demo**
   - `npm run dev`
   - Go to the ASCII demo page with the full grid.
   - Confirm `scroll`, `parchment`, `boxquote`, and other irregular borders show no text overlap.

## Tests to Add/Update
Add a test that proves the container size includes inset:
- Create an `AsciiBox` with overlay text of a known height.
- Use a design with thicker borders (`scroll`, `parchment`, `boxquote`).
- Assert that computed container minHeight is **>= overlayHeight + insetHeight**.

Suggested test file:
- `tests/frontend/AsciiBoxOverlayLayout.test.tsx`

## Acceptance Criteria
- Overlay text never crosses the ASCII border for any design.
- Demo grid shows all 72 box styles in a readable layout with overlays.
- Tests validate container sizing against overlay + inset.
