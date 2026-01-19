# AsciiBox Overlay Width Constraint Plan

## Problem
After fixing overlay height overflow (using design metadata for inset), the gap between grid cards disappears. The recap/quote boxes visually touch because the AsciiBox container expands horizontally and ignores the grid gap.

## Root Cause
`AsciiBox` sets `minWidth` using `overlaySize + inset`, where inset comes from the box config. In a grid or flex layout, this can exceed the available column width. CSS `min-width` **wins** over grid sizing, so the box overflows into the gap. Adding `maxWidth: 100%` does not fix it because `min-width` still forces the overflow.

In short: **we always force a minimum width based on overlay size, even when the parent layout is constrained.**

## Desired Behavior
- Height must expand to fit overlay content + inset (always).
- Width should respect the CSS layout (grid/flex), so gaps remain.
- The helper should not require devs to manage width; it should adapt to container constraints.

## Fix Strategy
Treat width and height differently:

1. **Height:** keep the current `minHeight = overlayHeight + insetHeight`. This prevents text from spilling below the border.
2. **Width:** do **not** blindly enforce `minWidth`.
   - If the box has explicit width/cols props, honor them.
   - Otherwise, clamp `minWidth` to the available container width (from the ResizeObserver).
   - If container width is unknown (initial render), skip `minWidth` and let the layout settle.

This preserves gaps in constrained layouts while still supporting overlay-driven sizing in unconstrained layouts.

## Implementation Steps
1. **Locate sizing logic**
   - File: `src/components/ui/AsciiBox.tsx`
   - Find `boxStyle` and the `minWidth/minHeight` block.

2. **Compute inset pixels using design metadata**
   - Use `layoutMeta.border` + `layout.padding`.
   - Convert to px with `metrics.charWidthPx + metrics.letterSpacingPx` and `metrics.lineHeightPx`.
   - This is already done for `overlayInsetPx`; reuse it.

3. **Clamp overlay-driven width**
   - Add a helper value:
     - `overlayWidthPx = overlaySize.width + overlayInsetPx.width`
     - `availableWidthPx = containerSize.width` (from ResizeObserver)
   - If no explicit width/cols:
     - `minWidth = (availableWidthPx > 0) ? Math.min(overlayWidthPx, availableWidthPx) : undefined`
   - If explicit width/cols are provided:
     - keep existing explicit sizing and skip overlay minWidth.

4. **Keep height expansion**
   - `minHeight = overlaySize.height + overlayInsetPx.height` should remain untouched.

5. **Ensure overlay text wraps instead of forcing width**
   - Add CSS to `.ascii-overlay-content` if needed:
     - `overflow-wrap: anywhere;`
     - `word-break: break-word;`
   - This ensures long words don’t demand wider boxes.

## Tests to Add/Update
Add a test to confirm width clamping in constrained layouts:
- Render `AsciiBox` with overlay content wider than the container.
- Set the container width to a fixed value (e.g., 320px).
- Expect `minWidth` to be **undefined** or **<= container width**.
- Keep existing height test to ensure `minHeight` expands correctly.

Suggested test:
- `tests/frontend/AsciiBox.test.tsx` or a new `tests/frontend/AsciiBoxOverlayLayout.test.tsx`

## Acceptance Criteria
- Recap/quote boxes keep their visual gap in the overview grid.
- No overlay text spills past the ASCII border.
- Helper works with standard CSS layouts without manual width hacks.
