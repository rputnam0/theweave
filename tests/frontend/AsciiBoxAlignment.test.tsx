import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AsciiBox } from '../../src/components/AsciiBox';
import { computeInkFit } from '../../src/components/ui/ascii/inkFit';
import { displayWidth } from '../../src/components/ui/ascii/displayWidth';

type DesignSpec = {
  tl: string;
  tr: string;
  bl: string;
  br: string;
  h: string;
  v: string;
};

const DESIGN_SPECS: Record<string, DesignSpec> = {
  simple: { tl: '*', tr: '*', bl: '*', br: '*', h: '*', v: '*' },
  ansi: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  'ansi-rounded': { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  'ansi-double': { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  boxquote: { tl: ',', tr: '-', bl: '`', br: '-', h: '-', v: '|' },
  shell: { tl: '#', tr: '#', bl: '#', br: '#', h: '#', v: '#' },
  parchment: { tl: '/', tr: '\\', bl: '\\', br: '/', h: '-', v: '|' },
};

const buildBoxText = (design: string, cols: number, rows: number) => {
  const spec = DESIGN_SPECS[design];
  const innerCols = Math.max(0, cols - 2);
  const middle = `${spec.v}${' '.repeat(innerCols)}${spec.v}`;
  const top = `${spec.tl}${spec.h.repeat(innerCols)}${spec.tr}`;
  const bottom = `${spec.bl}${spec.h.repeat(innerCols)}${spec.br}`;
  const lines = [top, ...Array.from({ length: Math.max(0, rows - 2) }, () => middle), bottom];
  return lines.join('\n');
};

const parseFontSize = (font: string) => {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : 16;
};

const makeContext = () => {
  const ctx = {
    font: '',
    measureText: (value: string) => {
      const fontSize = parseFontSize(ctx.font);
      const baseWidth = fontSize * 0.6;
      const ch = value[0] || ' ';
      let ascent = fontSize * 0.75;
      let descent = fontSize * 0.25;
      let left = 0;
      let right = baseWidth;

      if (ch === '_' || ch === '-') {
        ascent = fontSize * 0.1;
        descent = fontSize * 0.2;
      }
      if (ch === '/' || ch === '\\') {
        left = fontSize * 0.1;
        right = baseWidth + fontSize * 0.1;
      }
      if (ch === '╭' || ch === '╮' || ch === '╰' || ch === '╯') {
        ascent = fontSize * 0.7;
        descent = fontSize * 0.3;
      }
      if (ch === '│' || ch === '║' || ch === '|') {
        right = baseWidth * 0.5;
      }

      return {
        width: baseWidth,
        actualBoundingBoxAscent: ascent,
        actualBoundingBoxDescent: descent,
        actualBoundingBoxLeft: left,
        actualBoundingBoxRight: right,
      };
    },
  };
  return ctx as unknown as CanvasRenderingContext2D;
};

const parseTransform = (transform: string) => {
  const translateMatch = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
  const scaleMatch = transform.match(/scale\(([-\d.]+),\s*([-\d.]+)\)/);
  return {
    tx: translateMatch ? Number(translateMatch[1]) : 0,
    ty: translateMatch ? Number(translateMatch[2]) : 0,
    sx: scaleMatch ? Number(scaleMatch[1]) : 1,
    sy: scaleMatch ? Number(scaleMatch[2]) : 1,
  };
};

const computeAlignedBounds = (
  fit: ReturnType<typeof computeInkFit>,
  transform: ReturnType<typeof parseTransform>,
  cols: number,
  rows: number,
  charWidth: number,
  lineHeight: number
) => {
  if (!fit) return null;
  const minX = (fit.minX * transform.sx) + transform.tx;
  const maxX = (fit.maxX * transform.sx) + transform.tx;
  const minY = (fit.minY * transform.sy) + transform.ty;
  const maxY = (fit.maxY * transform.sy) + transform.ty;
  return {
    minX,
    maxX,
    minY,
    maxY,
    targetWidth: cols * charWidth,
    targetHeight: rows * lineHeight,
  };
};

describe('AsciiBox alignment against CSS bounds', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => makeContext());
    HTMLElement.prototype.getBoundingClientRect = function () {
      const element = this as HTMLElement;
      if (element.tagName === 'PRE') {
        const parent = element.parentElement as HTMLElement | null;
        const fontSize = Number.parseFloat(parent?.style.fontSize || '') || 16;
        const lineHeight = Number.parseFloat(parent?.style.lineHeight || '') || fontSize * 1.2;
        const text = element.textContent || '';
        const lines = text.split('\n');
        const maxCols = Math.max(1, ...lines.map((line) => displayWidth(line)));
        const width = maxCols * fontSize * 0.6;
        const height = lines.length * lineHeight;
        const left = Number.parseFloat(element.style.marginLeft) || 0;
        const top = Number.parseFloat(element.style.marginTop) || 0;
        return { width, height, left, top, right: left + width, bottom: top + height } as DOMRect;
      }
      const width = Number.parseFloat(element.style.width) || 320;
      const height = Number.parseFloat(element.style.height) || 200;
      const left = Number.parseFloat(element.style.marginLeft) || 0;
      const top = Number.parseFloat(element.style.marginTop) || 0;
      return { width, height, left, top, right: left + width, bottom: top + height } as DOMRect;
    };
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    vi.restoreAllMocks();
  });

  const cases = [
    {
      design: 'simple',
      fontSize: 14,
      lineHeight: 18,
      width: 280,
      height: 160,
      padding: 12,
      offsetX: 34,
      offsetY: 22,
    },
    {
      design: 'ansi-rounded',
      fontSize: 16,
      lineHeight: 20,
      width: 300,
      height: 150,
      padding: '1ch',
      offsetX: 8,
      offsetY: 40,
    },
    {
      design: 'parchment',
      fontSize: 18,
      lineHeight: 24,
      width: 520,
      height: 240,
      padding: '2ch',
      offsetX: 55,
      offsetY: 70,
    },
    {
      design: 'ansi-double',
      fontSize: 12,
      lineHeight: 16,
      width: 260,
      height: 180,
      padding: 6,
      offsetX: 90,
      offsetY: 10,
    },
    {
      design: 'boxquote',
      fontSize: 15,
      lineHeight: 19,
      width: 360,
      height: 200,
      padding: '1.5ch',
      offsetX: 12,
      offsetY: 60,
    },
    {
      design: 'shell',
      fontSize: 13,
      lineHeight: 17,
      width: 310,
      height: 190,
      padding: 8,
      offsetX: 25,
      offsetY: 33,
    },
    {
      design: 'ansi',
      fontSize: 17,
      lineHeight: 22,
      width: 340,
      height: 210,
      padding: 10,
      offsetX: 64,
      offsetY: 12,
    },
  ];

  cases.forEach((testCase) => {
    it(`keeps ${testCase.design} ink aligned at ${testCase.width}x${testCase.height}`, async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const fetchMock = vi.fn(async (url: string, options: RequestInit) => {
        const body = JSON.parse(options.body as string);
        const text = buildBoxText(body.design, body.cols, body.rows);
        return {
          ok: true,
          json: async () => ({ boxText: text, measured: { cols: body.cols, rows: body.rows } }),
        };
      });
      vi.stubGlobal('fetch', fetchMock);

      const element = (
        <AsciiBox
          design={testCase.design}
          content={`${testCase.design} demo`}
          padding={testCase.padding as number}
          style={{
            width: `${testCase.width}px`,
            height: `${testCase.height}px`,
            marginLeft: `${testCase.offsetX}px`,
            marginTop: `${testCase.offsetY}px`,
            fontSize: `${testCase.fontSize}px`,
            lineHeight: `${testCase.lineHeight}px`,
          }}
        />
      );

      const { container, rerender } = render(element);
      rerender(element);

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());

      const root = container.querySelector('.ascii-root') as HTMLDivElement;
      const pre = container.querySelector('.ascii-pre') as HTMLPreElement;
      expect(root).toBeTruthy();
      expect(pre).toBeTruthy();

      const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      const cols = request.cols;
      const rows = request.rows;

      const ctx = makeContext();
      ctx.font = `${testCase.fontSize}px monospace`;
      const fit = computeInkFit({
        text: buildBoxText(testCase.design, cols, rows),
        cols,
        rows,
        charWidthPx: testCase.fontSize * 0.6,
        lineHeightPx: testCase.lineHeight,
        measureText: (value) => ctx.measureText(value),
      });
      expect(fit).not.toBeNull();

      const transform = parseTransform(pre.style.transform || '');
      expect(Number.isFinite(transform.sx)).toBe(true);
      expect(Number.isFinite(transform.sy)).toBe(true);
      expect(Number.isFinite(transform.tx)).toBe(true);
      expect(Number.isFinite(transform.ty)).toBe(true);

      const aligned = computeAlignedBounds(
        fit,
        transform,
        cols,
        rows,
        testCase.fontSize * 0.6,
        testCase.lineHeight
      );
      expect(aligned).not.toBeNull();
      if (!aligned) return;

      const tolerance = 1.5;
      expect(aligned.minX).toBeGreaterThanOrEqual(-tolerance);
      expect(aligned.minY).toBeGreaterThanOrEqual(-tolerance);
      expect(aligned.maxX).toBeLessThanOrEqual(aligned.targetWidth + tolerance);
      expect(aligned.maxY).toBeLessThanOrEqual(aligned.targetHeight + tolerance);

      warnSpy.mockRestore();
    });
  });
});
