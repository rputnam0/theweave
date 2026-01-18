import { describe, expect, it } from 'vitest';
import samples from '../../src/components/ui/ascii/designSamples.json';
import { detectFrame } from '../../src/components/ui/ascii/frame';
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
});
