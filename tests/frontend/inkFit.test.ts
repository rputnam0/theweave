import { describe, expect, it } from 'vitest';
import { computeInkFit } from '../../src/components/ui/ascii/inkFit';
import { displayWidth } from '../../src/components/ui/ascii/displayWidth';

type MeasureText = (value: string) => {
  width?: number;
  actualBoundingBoxAscent?: number;
  actualBoundingBoxDescent?: number;
  actualBoundingBoxLeft?: number;
  actualBoundingBoxRight?: number;
};

const createMeasureText = (fontSize: number): MeasureText => {
  const baseWidth = fontSize * 0.6;
  return (value) => {
    if (value === 'Hg') {
      return {
        actualBoundingBoxAscent: fontSize * 0.8,
        actualBoundingBoxDescent: fontSize * 0.2,
        width: baseWidth * 2,
      };
    }
    const ch = value[0] || ' ';
    let ascent = fontSize * 0.75;
    let descent = fontSize * 0.25;
    let left = 0;
    let right = baseWidth;

    if (ch === '_') {
      ascent = fontSize * 0.05;
      descent = fontSize * 0.25;
    }
    if (ch === '/') {
      left = fontSize * 0.1;
      right = baseWidth + fontSize * 0.1;
    }
    if (ch === '\\') {
      left = fontSize * 0.1;
      right = baseWidth + fontSize * 0.1;
    }
    if (ch === '|') {
      right = baseWidth * 0.5;
    }
    if (ch === '╭' || ch === '╮' || ch === '╰' || ch === '╯') {
      ascent = fontSize * 0.7;
      descent = fontSize * 0.3;
    }
    return {
      actualBoundingBoxAscent: ascent,
      actualBoundingBoxDescent: descent,
      actualBoundingBoxLeft: left,
      actualBoundingBoxRight: right,
      width: baseWidth,
    };
  };
};

const padToCols = (line: string, cols: number) =>
  line.length >= cols ? line : line + ' '.repeat(cols - line.length);

const samples = [
  {
    design: 'simple',
    lines: ['*****', '*   *', '*****'],
  },
  {
    design: 'ansi',
    lines: ['+---+', '|   |', '+---+'],
  },
  {
    design: 'ansi-rounded',
    lines: ['╭───╮', '│   │', '╰───╯'],
  },
  {
    design: 'ansi-double',
    lines: ['╔═══╗', '║   ║', '╚═══╝'],
  },
  {
    design: 'boxquote',
    lines: [',----', '| hi ', '`----'],
  },
  {
    design: 'shell',
    lines: ['####', '#  #', '####'],
  },
  {
    design: 'parchment',
    lines: [' ____', '/\\  \\', '\\_|__'],
  },
];

describe('computeInkFit', () => {
  const scenarios = [
    { fontSize: 12, lineHeight: 14, charWidth: 7 },
    { fontSize: 16, lineHeight: 20, charWidth: 9 },
    { fontSize: 20, lineHeight: 24, charWidth: 12 },
  ];

  samples.forEach((sample) => {
    scenarios.forEach((scenario) => {
      it(`aligns ${sample.design} at ${scenario.fontSize}px`, () => {
        const cols = Math.max(...sample.lines.map((line) => displayWidth(line)));
        const rows = sample.lines.length;
        const text = sample.lines.map((line) => padToCols(line, cols)).join('\n');
        const fit = computeInkFit({
          text,
          cols,
          rows,
          charWidthPx: scenario.charWidth,
          lineHeightPx: scenario.lineHeight,
          measureText: createMeasureText(scenario.fontSize),
        });
        expect(fit).not.toBeNull();
        if (!fit) return;

        const targetWidth = cols * scenario.charWidth;
        const targetHeight = rows * scenario.lineHeight;
        const alignedMinX = (fit.minX * fit.scaleX) + fit.offsetX;
        const alignedMaxX = (fit.maxX * fit.scaleX) + fit.offsetX;
        const alignedMinY = (fit.minY * fit.scaleY) + fit.offsetY;
        const alignedMaxY = (fit.maxY * fit.scaleY) + fit.offsetY;

        expect(alignedMinX).toBeCloseTo(0, 4);
        expect(alignedMinY).toBeCloseTo(0, 4);
        expect(alignedMaxX).toBeCloseTo(targetWidth, 4);
        expect(alignedMaxY).toBeCloseTo(targetHeight, 4);
      });
    });
  });
});
