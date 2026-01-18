import { useContext, useLayoutEffect, useMemo, useState } from 'react';
import { AsciiMetricsContext } from './metricsContext';
import type { AsciiBoxPaddingCells, CssLength } from './types';

export const DEFAULT_MEASURE_CHARS = '*-/\\_|~`+=#╭╮╰╯┌┐└┘─│═║';

const buildFontString = (style: CSSStyleDeclaration) => {
  const fontStyle = style.fontStyle || 'normal';
  const fontWeight = style.fontWeight || '400';
  const fontSize = style.fontSize || '16px';
  const fontFamily = style.fontFamily || 'monospace';
  return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
};

const measureCharWidth = (font: string, chars: string) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 8;
  ctx.font = font;
  let max = 0;
  for (const ch of chars) {
    const width = ctx.measureText(ch).width;
    if (width > max) max = width;
  }
  return max || 8;
};

const getRootFontSize = () => {
  if (typeof window === 'undefined') return 16;
  const style = getComputedStyle(document.documentElement);
  return parseFloat(style.fontSize) || 16;
};

const parseCssNumber = (value?: CssLength) => {
  if (typeof value === 'number') return { unit: 'px', value };
  if (!value) return null;
  const match = String(value).trim().match(/^(-?\d*\.?\d+)([a-z%]+)?$/i);
  if (!match) return null;
  return { value: Number(match[1]), unit: (match[2] || 'px').toLowerCase() };
};

export type AsciiCellMetrics = {
  charWidthPx: number;
  lineHeightPx: number;
};

export const resolveCssLengthPx = (
  value: CssLength | undefined,
  metrics: AsciiCellMetrics,
  element: HTMLElement
) => {
  const parsed = parseCssNumber(value);
  if (!parsed) return null;
  if (parsed.unit === 'px') return parsed.value;
  if (parsed.unit === 'rem') return parsed.value * getRootFontSize();
  if (parsed.unit === 'em') {
    const style = getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize) || 16;
    return parsed.value * fontSize;
  }
  if (parsed.unit === 'ch') return parsed.value * metrics.charWidthPx;
  if (parsed.unit === 'lh') return parsed.value * metrics.lineHeightPx;
  return null;
};

export const snapToCols = (px: number, metrics: AsciiCellMetrics) =>
  Math.max(1, Math.round(px / metrics.charWidthPx));

export const snapToRows = (px: number, metrics: AsciiCellMetrics) =>
  Math.max(1, Math.round(px / metrics.lineHeightPx));

export const snapPadding = (
  padding: { top?: CssLength; right?: CssLength; bottom?: CssLength; left?: CssLength } | undefined,
  metrics: AsciiCellMetrics,
  element: HTMLElement
): AsciiBoxPaddingCells => {
  const topPx = resolveCssLengthPx(padding?.top, metrics, element) ?? 0;
  const rightPx = resolveCssLengthPx(padding?.right, metrics, element) ?? 0;
  const bottomPx = resolveCssLengthPx(padding?.bottom, metrics, element) ?? 0;
  const leftPx = resolveCssLengthPx(padding?.left, metrics, element) ?? 0;
  return {
    top: Math.max(0, Math.round(topPx / metrics.lineHeightPx)),
    right: Math.max(0, Math.round(rightPx / metrics.charWidthPx)),
    bottom: Math.max(0, Math.round(bottomPx / metrics.lineHeightPx)),
    left: Math.max(0, Math.round(leftPx / metrics.charWidthPx)),
  };
};

export const useAsciiCellMetrics = (
  element: HTMLElement | null,
  measureChars: string = DEFAULT_MEASURE_CHARS
) => {
  const contextMetrics = useContext(AsciiMetricsContext);
  const [metrics, setMetrics] = useState<AsciiCellMetrics | null>(contextMetrics);

  useLayoutEffect(() => {
    if (!element || contextMetrics) return;
    const style = getComputedStyle(element);
    const fontString = buildFontString(style);
    const fontSize = parseFloat(style.fontSize) || 16;
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
    const charWidth = measureCharWidth(fontString, measureChars);
    setMetrics({ charWidthPx: charWidth, lineHeightPx: lineHeight });
  }, [element, measureChars, contextMetrics]);

  return useMemo(() => metrics || { charWidthPx: 8, lineHeightPx: 16 }, [metrics]);
};
