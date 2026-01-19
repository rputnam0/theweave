import { displayWidth } from './displayWidth';

export type AsciiFrame = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  confidence: number;
};

export type AsciiBounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
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

const buildRowCells = (line: string) => {
  const cells: string[] = [];
  for (const ch of line) {
    const width = displayWidth(ch);
    for (let i = 0; i < width; i += 1) {
      cells.push(ch);
    }
  }
  return cells;
};

export const detectInnerBounds = (text: string, frame: AsciiFrame, borderGlyphs?: string): AsciiBounds | null => {
  const lines = text.split('\n');
  if (!lines.length) return null;
  const glyphSet = new Set((borderGlyphs ?? '').split(''));
  const rowCells = lines.map((line) => buildRowCells(line));
  const maxCols = Math.max(0, ...rowCells.map((cells) => cells.length));
  const padded = rowCells.map((cells) => {
    if (cells.length >= maxCols) return cells;
    return [...cells, ...Array.from({ length: maxCols - cells.length }, () => SPACE)];
  });

  const interiorStarts: number[] = [];
  const interiorEnds: number[] = [];
  const candidates: Array<{
    row: number;
    innerLeft: number;
    innerRight: number;
    innerWidth: number;
    leftBorderEnd: number;
    rightBorderEnd: number;
    leftBorderWidth: number;
    rightBorderWidth: number;
  }> = [];

  const extendBorderRun = (
    cells: string[],
    borderChar: string,
    end: number,
    direction: number,
    gapLimit = 1
  ) => {
    if (!borderChar || borderChar === SPACE) return end;
    let cursor = end + direction;
    let gap = 0;
    while (cursor >= frame.left && cursor <= frame.right) {
      const cell = cells[cursor] ?? SPACE;
      if (cell === SPACE) {
        gap += 1;
        if (gap > gapLimit) break;
        cursor += direction;
        continue;
      }
      if (cell === borderChar) {
        end = cursor;
        cursor += direction;
        continue;
      }
      break;
    }
    return end;
  };

  for (let row = frame.top + 1; row <= frame.bottom - 1; row += 1) {
    const cells = padded[row];
    if (!cells) continue;
    let leftBorderStart = -1;
    let rightBorderStart = -1;
    for (let col = frame.left; col <= frame.right; col += 1) {
      if (cells[col] !== SPACE) {
        leftBorderStart = col;
        break;
      }
    }
    for (let col = frame.right; col >= frame.left; col -= 1) {
      if (cells[col] !== SPACE) {
        rightBorderStart = col;
        break;
      }
    }
    if (leftBorderStart === -1 || rightBorderStart === -1 || rightBorderStart <= leftBorderStart) continue;

    let leftBorderEnd = leftBorderStart;
    while (leftBorderEnd + 1 <= frame.right && cells[leftBorderEnd + 1] !== SPACE) {
      leftBorderEnd += 1;
    }

    let rightBorderEnd = rightBorderStart;
    while (rightBorderEnd - 1 >= frame.left && cells[rightBorderEnd - 1] !== SPACE) {
      rightBorderEnd -= 1;
    }

    leftBorderEnd = extendBorderRun(cells, cells[leftBorderStart], leftBorderEnd, 1);
    rightBorderEnd = extendBorderRun(cells, cells[rightBorderStart], rightBorderEnd, -1);

    const leftBorderWidth = leftBorderEnd - leftBorderStart + 1;
    const rightBorderWidth = rightBorderStart - rightBorderEnd + 1;
    const innerLeft = leftBorderEnd + 1;
    const innerRight = rightBorderEnd - 1;
    if (innerRight < innerLeft) continue;
    const innerWidth = innerRight - innerLeft + 1;
    let spaceCount = 0;
    const uniqueNonSpace = new Set<string>();
    for (let col = innerLeft; col <= innerRight; col += 1) {
      const cell = cells[col] ?? SPACE;
      if (cell === SPACE) {
        spaceCount += 1;
      } else {
        uniqueNonSpace.add(cell);
      }
    }
    const isBorderFill = spaceCount === 0 && uniqueNonSpace.size === 1;
    if (isBorderFill) continue;
    interiorStarts.push(innerLeft);
    interiorEnds.push(innerRight);
    candidates.push({
      row,
      innerLeft,
      innerRight,
      innerWidth,
      leftBorderEnd,
      rightBorderEnd,
      leftBorderWidth,
      rightBorderWidth,
    });
  }

  if (!interiorStarts.length || !interiorEnds.length) return null;
  const getMedian = (values: number[]) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const getMode = (values: number[]) => {
    if (!values.length) return 0;
    const counts = new Map<number, number>();
    let bestValue = values[0];
    let bestCount = 0;
    for (const value of values) {
      const nextCount = (counts.get(value) ?? 0) + 1;
      counts.set(value, nextCount);
      if (nextCount > bestCount) {
        bestCount = nextCount;
        bestValue = value;
      }
    }
    return bestValue;
  };

  const medianWidth = getMedian(candidates.map((candidate) => candidate.innerWidth));
  const widthThreshold = Math.max(1, medianWidth * 0.6);
  const useCandidates = candidates.filter((candidate) => candidate.innerWidth >= widthThreshold);
  const activeCandidates = useCandidates.length ? useCandidates : candidates;

  const maxInnerLeft = Math.max(...activeCandidates.map((candidate) => candidate.innerLeft));
  const minInnerRight = Math.min(...activeCandidates.map((candidate) => candidate.innerRight));
  const innerLeft = Math.max(frame.left + 1, Math.min(maxInnerLeft, frame.right - 1));
  const innerRight = Math.max(innerLeft, Math.min(minInnerRight, frame.right - 1));

  const medianLeftEnd = getMode(activeCandidates.map((candidate) => candidate.leftBorderEnd));
  const medianRightEnd = getMode(activeCandidates.map((candidate) => candidate.rightBorderEnd));
  const medianLeftWidth = getMode(activeCandidates.map((candidate) => candidate.leftBorderWidth));
  const medianRightWidth = getMode(activeCandidates.map((candidate) => candidate.rightBorderWidth));
  const candidateByRow = new Map(activeCandidates.map((candidate) => [candidate.row, candidate]));

  const matchesInterior = (candidate: typeof candidates[number]) => {
    if (Math.abs(candidate.leftBorderEnd - medianLeftEnd) > 1) return false;
    if (Math.abs(candidate.rightBorderEnd - medianRightEnd) > 1) return false;
    if (Math.abs(candidate.leftBorderWidth - medianLeftWidth) > 1) return false;
    if (Math.abs(candidate.rightBorderWidth - medianRightWidth) > 1) return false;
    if (Math.abs(candidate.innerLeft - innerLeft) > 1) return false;
    if (Math.abs(candidate.innerRight - innerRight) > 1) return false;
    return true;
  };

  const hasEdgeGlyphs = (row: number, edgeBand = 2) => {
    if (!glyphSet.size) return false;
    const cells = padded[row];
    if (!cells) return false;
    const leftLimit = Math.min(innerRight, innerLeft + edgeBand);
    for (let col = innerLeft; col <= leftLimit; col += 1) {
      if (glyphSet.has(cells[col] ?? SPACE)) return true;
    }
    const rightStart = Math.max(innerLeft, innerRight - edgeBand);
    for (let col = rightStart; col <= innerRight; col += 1) {
      if (glyphSet.has(cells[col] ?? SPACE)) return true;
    }
    return false;
  };

  let innerTop = -1;
  let innerBottom = -1;
  for (let row = frame.top + 1; row <= frame.bottom - 1; row += 1) {
    const candidate = candidateByRow.get(row);
    if (candidate && matchesInterior(candidate) && !hasEdgeGlyphs(row)) {
      innerTop = row;
      break;
    }
  }
  for (let row = frame.bottom - 1; row >= frame.top + 1; row -= 1) {
    const candidate = candidateByRow.get(row);
    if (candidate && matchesInterior(candidate) && !hasEdgeGlyphs(row)) {
      innerBottom = row;
      break;
    }
  }
  if (innerTop === -1 || innerBottom === -1) {
    for (let row = frame.top + 1; row <= frame.bottom - 1; row += 1) {
      const candidate = candidateByRow.get(row);
      if (candidate && matchesInterior(candidate)) {
        innerTop = row;
        break;
      }
    }
    for (let row = frame.bottom - 1; row >= frame.top + 1; row -= 1) {
      const candidate = candidateByRow.get(row);
      if (candidate && matchesInterior(candidate)) {
        innerBottom = row;
        break;
      }
    }
  }

  if (innerTop === -1 || innerBottom === -1 || innerBottom <= innerTop) {
    innerTop = Math.min(frame.bottom - 1, frame.top + 1);
    innerBottom = Math.max(innerTop, frame.bottom - 1);
  }

  return {
    left: innerLeft,
    right: innerRight,
    top: innerTop,
    bottom: innerBottom,
  };
};
