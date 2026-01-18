# ASCII Box Solver

## Goal
Align the *primary box frame* to the CSS container for every boxes design, while allowing decorative art to spill outside the frame (e.g., unicorn thought bubbles). This keeps layout alignment correct even when designs include non-rectangular artwork.

## Inputs
- `boxText` returned by the boxes API.
- Per-design glyph sets extracted from `boxes/boxes/boxes-config`.
- The CSS box size (layout cols/rows + font metrics + letter spacing).

## Frame Detection (Core Rule)
We detect the *frame* directly from `boxText` by finding the densest rectangular region of non-space glyphs:
1) Compute per-row non-space span (min/max col).
2) Find top and bottom rows whose span is at least 60% of the max span.
3) Within that row range, compute per-column non-space counts.
4) Choose left/right columns whose counts exceed 60% of the row count.
5) If the side counts are weak, fall back to min/max span over all ink.

Result: `{top, bottom, left, right, confidence}`.

## Fit Strategy
1) Build `frameText` by masking any glyphs outside the detected frame to spaces.
2) Compute ink-fit for:
   - the full `boxText` (full-ink fit)
   - `frameText` (frame-ink fit)
3) Measure a hidden DOM `<pre>` of `frameText` to get a direct frame DOM fit.
4) Choose the fit that minimizes frame overflow relative to the CSS container:
   - Prefer `frame DOM fit` if available
   - Else `frame ink fit`
   - Fall back to full-ink fit

## Automated Feedback Loop
- Frame detection runs on every `boxText` response to isolate the primary border.
- The solver computes a fit and checks overflow against the CSS box.
- When the container changes (resize, font changes, padding changes), the solver recalculates and re-fits.

## Visual Verification
- Demo page supports a `debug=1` query param to draw a dashed red rectangle over the detected frame.
- This provides a quick visual check that the frame aligns to the CSS box even when art spills.

## Decorative Art Handling
For artwork-heavy designs (e.g., `unicornthink`, `unicornsay`), the frame fit is aligned to the CSS box, and decorative art is allowed to extend beyond the frame on any side.

## Glyph Metrics
We measure glyph width using the per-design glyph set extracted from config:
- `scripts/extract-box-glyphs.mjs`
- Output: `src/components/ui/ascii/designGlyphs.json`

Letter-spacing is accounted for in the column-to-pixel math.

## Samples for Testing
We extract representative samples from config:
- `scripts/extract-box-samples.mjs`
- Output: `src/components/ui/ascii/designSamples.json`

These samples drive tests for frame detection correctness across all designs.

Open the demo with debug overlays:
`http://localhost:3001/?demo=ascii-boxes&debug=1`

This draws a dashed red rectangle for the detected frame so you can visually confirm it aligns to each CSS box.
