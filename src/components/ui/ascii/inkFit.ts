import { displayWidth } from './displayWidth';

type TextMetricsLike = {
  width?: number;
  actualBoundingBoxAscent?: number;
  actualBoundingBoxDescent?: number;
  actualBoundingBoxLeft?: number;
  actualBoundingBoxRight?: number;
  fontBoundingBoxAscent?: number;
  fontBoundingBoxDescent?: number;
  emHeightAscent?: number;
  emHeightDescent?: number;
};

export type InkFit = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  inkWidth: number;
  inkHeight: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
};

type ComputeInkFitArgs = {
  text: string;
  cols: number;
  rows: number;
  charWidthPx: number;
  lineHeightPx: number;
  letterSpacingPx?: number;
  measureText: (value: string) => TextMetricsLike;
};

const fallbackAscent = (lineHeightPx: number) => lineHeightPx * 0.8;
const fallbackDescent = (lineHeightPx: number) => Math.max(1, lineHeightPx * 0.2);

const resolveMetric = (
  metrics: TextMetricsLike,
  keys: Array<keyof TextMetricsLike>,
  fallback: number
) => {
  for (const key of keys) {
    const value = metrics[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return fallback;
};

const getFontMetrics = (measureText: (value: string) => TextMetricsLike, lineHeightPx: number) => {
  const metrics = measureText('Hg');
  const ascent = resolveMetric(
    metrics,
    ['actualBoundingBoxAscent', 'fontBoundingBoxAscent', 'emHeightAscent'],
    fallbackAscent(lineHeightPx)
  );
  const descent = resolveMetric(
    metrics,
    ['actualBoundingBoxDescent', 'fontBoundingBoxDescent', 'emHeightDescent'],
    fallbackDescent(lineHeightPx)
  );
  const height = ascent + descent;
  const leading = Math.max(0, lineHeightPx - height);
  const baselineOffset = (leading / 2) + ascent;
  return { ascent, descent, height, baselineOffset };
};

export const computeInkFit = ({
  text,
  cols,
  rows,
  charWidthPx,
  lineHeightPx,
  letterSpacingPx = 0,
  measureText,
}: ComputeInkFitArgs): InkFit | null => {
  if (!text) return null;
  const fontMetrics = getFontMetrics(measureText, lineHeightPx);
  const lines = text.split('\n');
  if (!lines.length) return null;
  const advance = charWidthPx + letterSpacingPx;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  const glyphCache = new Map<string, { ascent: number; descent: number; left: number; right: number }>();
  const getGlyph = (ch: string) => {
    const cached = glyphCache.get(ch);
    if (cached) return cached;
    const metrics = measureText(ch);
    const ascent = resolveMetric(
      metrics,
      ['actualBoundingBoxAscent', 'fontBoundingBoxAscent', 'emHeightAscent'],
      fontMetrics.ascent
    );
    const descent = resolveMetric(
      metrics,
      ['actualBoundingBoxDescent', 'fontBoundingBoxDescent', 'emHeightDescent'],
      fontMetrics.descent
    );
    const left = resolveMetric(metrics, ['actualBoundingBoxLeft'], 0);
    const right = resolveMetric(metrics, ['actualBoundingBoxRight', 'width'], charWidthPx);
    const resolved = { ascent, descent, left, right };
    glyphCache.set(ch, resolved);
    return resolved;
  };

  for (let row = 0; row < lines.length; row += 1) {
    const line = lines[row];
    let col = 0;
    const rowTop = row * lineHeightPx;
    for (const ch of line) {
      const widthCols = displayWidth(ch);
      if (ch !== ' ') {
        const glyph = getGlyph(ch);
        const baseX = col * advance;
        const leftX = baseX - glyph.left;
        const rightX = baseX + glyph.right;
        const topY = rowTop + fontMetrics.baselineOffset - glyph.ascent;
        const bottomY = rowTop + fontMetrics.baselineOffset + glyph.descent;
        if (leftX < minX) minX = leftX;
        if (rightX > maxX) maxX = rightX;
        if (topY < minY) minY = topY;
        if (bottomY > maxY) maxY = bottomY;
      }
      col += widthCols;
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  const targetWidth = (cols * charWidthPx) + (Math.max(0, cols - 1) * letterSpacingPx);
  const targetHeight = rows * lineHeightPx;
  const inkWidth = Math.max(1, maxX - minX);
  const inkHeight = Math.max(1, maxY - minY);
  const scaleX = targetWidth / inkWidth;
  const scaleY = targetHeight / inkHeight;
  const offsetX = -minX * scaleX;
  const offsetY = -minY * scaleY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    inkWidth,
    inkHeight,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
  };
};
