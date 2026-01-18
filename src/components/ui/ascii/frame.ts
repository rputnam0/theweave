import { displayWidth } from './displayWidth';

export type AsciiFrame = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  confidence: number;
};

type RowStats = {
  min: number;
  max: number;
  span: number;
  hasInk: boolean;
};

const SPACE = ' ';

const buildRowStats = (lines: string[]) => {
  const rows: RowStats[] = [];
  let maxCols = 0;
  for (const line of lines) {
    let col = 0;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const ch of line) {
      const width = displayWidth(ch);
      if (ch !== SPACE) {
        const left = col;
        const right = col + width - 1;
        if (left < min) min = left;
        if (right > max) max = right;
      }
      col += width;
    }
    if (col > maxCols) maxCols = col;
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      rows.push({ min: 0, max: 0, span: 0, hasInk: false });
    } else {
      rows.push({ min, max, span: max - min + 1, hasInk: true });
    }
  }
  return { rows, maxCols };
};

const buildColCounts = (lines: string[], maxCols: number) => {
  const counts = Array.from({ length: maxCols }, () => 0);
  const rows = lines.length;
  for (let row = 0; row < rows; row += 1) {
    const line = lines[row];
    let col = 0;
    for (const ch of line) {
      const width = displayWidth(ch);
      if (ch !== SPACE) {
        for (let i = 0; i < width; i += 1) {
          if (col + i < maxCols) counts[col + i] += 1;
        }
      }
      col += width;
    }
  }
  return counts;
};

export const detectFrame = (text: string): AsciiFrame | null => {
  const lines = text.split('\n');
  if (!lines.length) return null;
  const { rows, maxCols } = buildRowStats(lines);
  const spans = rows.filter((row) => row.hasInk).map((row) => row.span);
  if (!spans.length) return null;
  const maxSpan = Math.max(...spans);
  const spanThreshold = Math.max(2, Math.round(maxSpan * 0.6));

  let top = rows.findIndex((row) => row.hasInk && row.span >= spanThreshold);
  let bottom = -1;
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    if (rows[i].hasInk && rows[i].span >= spanThreshold) {
      bottom = i;
      break;
    }
  }

  if (top === -1 || bottom === -1 || bottom <= top) {
    top = rows.findIndex((row) => row.hasInk);
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      if (rows[i].hasInk) {
        bottom = i;
        break;
      }
    }
  }

  if (top === -1 || bottom === -1 || bottom <= top) return null;

  const colCounts = buildColCounts(lines.slice(top, bottom + 1), maxCols);
  const rowCount = bottom - top + 1;
  const colThreshold = Math.max(1, Math.round(rowCount * 0.6));

  let left = colCounts.findIndex((count) => count >= colThreshold);
  let right = -1;
  for (let i = colCounts.length - 1; i >= 0; i -= 1) {
    if (colCounts[i] >= colThreshold) {
      right = i;
      break;
    }
  }

  if (left === -1 || right === -1 || right <= left) {
    const fallbackLeft = Math.min(...rows.filter((row) => row.hasInk).map((row) => row.min));
    const fallbackRight = Math.max(...rows.filter((row) => row.hasInk).map((row) => row.max));
    left = Number.isFinite(fallbackLeft) ? fallbackLeft : 0;
    right = Number.isFinite(fallbackRight) ? fallbackRight : maxCols - 1;
  }

  const width = right - left + 1;
  const height = bottom - top + 1;
  const widthScore = Math.min(1, width / maxSpan);
  const leftCount = colCounts[left] || 0;
  const rightCount = colCounts[right] || 0;
  const sideScore = Math.min(1, (leftCount + rightCount) / (2 * rowCount));
  const confidence = (widthScore + sideScore) / 2;

  if (confidence < 0.35) return null;

  return { top, bottom, left, right, confidence };
};

export const maskTextToFrame = (text: string, frame: AsciiFrame) => {
  const lines = text.split('\n');
  return lines
    .map((line) => {
      let col = 0;
      let output = '';
      for (const ch of line) {
        const width = displayWidth(ch);
        const keep = col + width - 1 >= frame.left && col <= frame.right;
        output += keep ? ch : SPACE.repeat(width);
        col += width;
      }
      return output;
    })
    .join('\n');
};
