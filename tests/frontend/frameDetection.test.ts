import { describe, expect, it } from 'vitest';
import samples from '../../src/components/ui/ascii/designSamples.json';
import designGlyphs from '../../src/components/ui/ascii/designGlyphs.json';
import { detectFrame, detectInnerBounds } from '../../src/components/ui/ascii/frame';
import { displayWidth } from '../../src/components/ui/ascii/displayWidth';

const artDesigns = new Set(['unicornthink', 'unicornsay']);

const getMaxWidth = (text: string) =>
  Math.max(0, ...text.split('\n').map((line) => displayWidth(line)));

describe('detectFrame', () => {
  it('finds a frame for sample designs', () => {
    let frameCount = 0;
    const unicornFrames = new Map<string, boolean>();
    for (const [design, sample] of Object.entries(samples)) {
      const frame = detectFrame(sample);
      if (!frame) {
        if (artDesigns.has(design)) {
          unicornFrames.set(design, false);
        }
        continue;
      }
      frameCount += 1;
      if (artDesigns.has(design)) {
        unicornFrames.set(design, true);
      }
      const totalRows = sample.split('\n').length;
      const maxWidth = getMaxWidth(sample);
      const frameWidth = frame.right - frame.left + 1;
      const frameHeight = frame.bottom - frame.top + 1;
      expect(frameWidth).toBeGreaterThan(0);
      expect(frameHeight).toBeGreaterThan(0);
      expect(frame.top).toBeGreaterThanOrEqual(0);
      expect(frame.left).toBeGreaterThanOrEqual(0);
      expect(frame.bottom).toBeLessThan(totalRows);
      expect(frame.right).toBeLessThan(maxWidth);
      if (artDesigns.has(design)) {
        expect(frameWidth).toBeLessThan(maxWidth);
      }
    }
    for (const design of artDesigns) {
      expect(unicornFrames.get(design)).toBe(true);
    }
    expect(frameCount).toBeGreaterThan(50);
  });

  it('detects inner bounds for scroll and parchment samples', () => {
    const scrollSample = samples['scroll-akn'] || samples.scroll;
    const parchmentSample = samples.parchment;
    expect(scrollSample).toBeTruthy();
    expect(parchmentSample).toBeTruthy();
    const scrollFrame = detectFrame(scrollSample);
    const parchmentFrame = detectFrame(parchmentSample);
    expect(scrollFrame).not.toBeNull();
    expect(parchmentFrame).not.toBeNull();
    if (!scrollFrame || !parchmentFrame) return;

    const scrollInner = detectInnerBounds(
      scrollSample,
      scrollFrame,
      designGlyphs['scroll-akn'] || designGlyphs.scroll
    );
    const parchmentInner = detectInnerBounds(parchmentSample, parchmentFrame, designGlyphs.parchment);
    expect(scrollInner).not.toBeNull();
    expect(parchmentInner).not.toBeNull();
    if (!scrollInner || !parchmentInner) return;

    expect(scrollInner.left).toBeGreaterThan(scrollFrame.left);
    expect(scrollInner.right).toBeLessThan(scrollFrame.right);
    expect(scrollInner.top).toBeGreaterThan(scrollFrame.top);
    expect(scrollInner.bottom).toBeLessThan(scrollFrame.bottom);

    expect(parchmentInner.left).toBeGreaterThan(parchmentFrame.left);
    expect(parchmentInner.right).toBeLessThan(parchmentFrame.right);
    expect(parchmentInner.top).toBeGreaterThan(parchmentFrame.top);
    expect(parchmentInner.bottom).toBeLessThan(parchmentFrame.bottom);

    const scrollLines = scrollSample.split('\n');
    const headerRow = scrollLines.findIndex((line) => line.includes('Scroll-AKN'));
    expect(headerRow).toBeGreaterThan(-1);
    if (headerRow >= 0) {
      const headerSlice = scrollLines[headerRow].slice(scrollFrame.left, scrollFrame.right + 1);
      const textIndex = headerSlice.indexOf('Scroll-AKN');
      const lastPipeBeforeText = headerSlice.lastIndexOf('|', textIndex);
      const firstPipeAfterText = headerSlice.indexOf('|', textIndex + 'Scroll-AKN'.length);
      expect(textIndex).toBeGreaterThanOrEqual(0);
      expect(lastPipeBeforeText).toBeGreaterThanOrEqual(0);
      expect(firstPipeAfterText).toBeGreaterThan(textIndex);
      expect(scrollInner.left).toBeGreaterThan(scrollFrame.left + lastPipeBeforeText);
      expect(scrollInner.right).toBeLessThan(scrollFrame.left + firstPipeAfterText);
    }
  });
});
