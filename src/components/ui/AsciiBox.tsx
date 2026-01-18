import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from './utils';
import { displayWidth } from './ascii/displayWidth';
import {
  DEFAULT_MEASURE_CHARS,
  resolveCssLengthPx,
  snapPadding,
  snapToCols,
  snapToRows,
  useAsciiCellMetrics,
} from './ascii/measure';
import { solveBox } from './ascii/boxesClient';
import type { AsciiBoxAlign, AsciiBoxMeasured, AsciiBoxPadding, CssLength } from './ascii/types';

type WrapPolicy = 'off' | 'hard' | 'word';
type OverflowPolicy = 'clip' | 'ellipsis';

type AsciiBoxProps = {
  design: string;
  children?: string;
  content?: string;
  className?: string;
  style?: CSSProperties;
  width?: CssLength;
  height?: CssLength;
  padding?: CssLength;
  paddingX?: CssLength;
  paddingY?: CssLength;
  paddingTop?: CssLength;
  paddingRight?: CssLength;
  paddingBottom?: CssLength;
  paddingLeft?: CssLength;
  align?: AsciiBoxAlign;
  tabs?: number;
  wrap?: WrapPolicy;
  overflow?: OverflowPolicy;
  cols?: number;
  rows?: number;
  apiBaseUrl?: string;
  debounceMs?: number;
  debug?: boolean;
  measureChars?: string;
  title?: string;
  titleClassName?: string;
  titleOffsetCols?: number;
  titleOffsetRows?: number;
};

const DEFAULT_DEBOUNCE_MS = 80;

const normalizeText = (text: string, tabs: number) => {
  const normalized = text.replace(/\r\n?/g, '\n');
  if (!tabs || tabs <= 0) return normalized.replace(/\t/g, '');
  const spaces = ' '.repeat(tabs);
  return normalized.replace(/\t/g, spaces);
};

const splitWords = (text: string) => text.trim().split(/\s+/);

const hardWrapLine = (line: string, width: number) => {
  if (width <= 0) return [''];
  const chunks: string[] = [];
  let current = '';
  for (const ch of line) {
    if (displayWidth(current + ch) > width) {
      if (current) chunks.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [''];
};

const wordWrapLine = (line: string, width: number) => {
  const prefixMatch = line.match(/^\s+/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const content = line.slice(prefix.length);
  const availableWidth = Math.max(1, width - displayWidth(prefix));
  const words = splitWords(content);
  if (!words.length) return [prefix];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const word = words[i];
    const tentative = `${current} ${word}`;
    if (displayWidth(tentative) <= availableWidth) {
      current = tentative;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines.map((wrapped) => `${prefix}${wrapped}`);
};

const trimToDisplayWidth = (line: string, width: number) => {
  if (width <= 0) return '';
  let current = '';
  let used = 0;
  for (const ch of line) {
    const nextWidth = displayWidth(ch);
    if (used + nextWidth > width) break;
    current += ch;
    used += nextWidth;
  }
  return current;
};

const applyOverflow = (line: string, width: number, overflow: OverflowPolicy) => {
  if (displayWidth(line) <= width) return line;
  if (overflow === 'ellipsis') {
    if (width <= 3) return trimToDisplayWidth(line, width);
    const clipped = trimToDisplayWidth(line, Math.max(0, width - 3));
    return `${clipped}...`;
  }
  return trimToDisplayWidth(line, width);
};

const wrapText = (text: string, width: number, wrap: WrapPolicy, overflow: OverflowPolicy) => {
  if (wrap === 'off') {
    return text
      .split('\n')
      .map((line) => applyOverflow(line, width, overflow))
      .join('\n');
  }
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map((paragraph) => {
      const lines = paragraph.split('\n');
      const wrapped: string[] = [];
      for (const line of lines) {
        if (wrap === 'hard') {
          wrapped.push(...hardWrapLine(line, width));
        } else {
          wrapped.push(...wordWrapLine(line, width));
        }
      }
      return wrapped.join('\n');
    })
    .join('\n\n');
};

const warnIfFractional = (label: string, px: number, unitPx: number) => {
  if (!import.meta.env?.DEV) return;
  const raw = px / unitPx;
  const remainder = Math.abs(raw - Math.round(raw));
  if (remainder > 0.25) {
    // eslint-disable-next-line no-console
    console.warn(`[AsciiBox] ${label} snaps with remainder ${remainder.toFixed(2)} cells.`);
  }
};

export function AsciiBox({
  design,
  children,
  content,
  className,
  style,
  width,
  height,
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  align = 'hcvc',
  tabs = 8,
  wrap = 'hard',
  overflow = 'clip',
  cols,
  rows,
  apiBaseUrl,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  debug = false,
  measureChars = DEFAULT_MEASURE_CHARS,
  title,
  titleClassName,
  titleOffsetCols = 0,
  titleOffsetRows = 0,
}: AsciiBoxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [boxText, setBoxText] = useState('');
  const [measured, setMeasured] = useState<AsciiBoxMeasured | null>(null);
  const [pending, setPending] = useState(false);
  const text = typeof content === 'string' ? content : (typeof children === 'string' ? children : '');
  const metrics = useAsciiCellMetrics(containerRef.current, measureChars);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    let frame = 0;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const next = entries[0].contentRect;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setContainerSize({ width: next.width, height: next.height });
      });
    });
    observer.observe(element);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const layout = useMemo(() => {
    const element = containerRef.current;
    if (!element) return null;
    const paddingSpec: AsciiBoxPadding = {
      top: paddingTop ?? paddingY ?? padding ?? 0,
      right: paddingRight ?? paddingX ?? padding ?? 0,
      bottom: paddingBottom ?? paddingY ?? padding ?? 0,
      left: paddingLeft ?? paddingX ?? padding ?? 0,
    };
    const widthPx = cols ? cols * metrics.charWidthPx : resolveCssLengthPx(width, metrics, element);
    const heightPx = rows ? rows * metrics.lineHeightPx : resolveCssLengthPx(height, metrics, element);
    if (widthPx !== null) warnIfFractional('width', widthPx, metrics.charWidthPx);
    if (heightPx !== null) warnIfFractional('height', heightPx, metrics.lineHeightPx);
    const snappedPadding = snapPadding(paddingSpec, metrics, element);
    if (paddingSpec.top) {
      const topPx = resolveCssLengthPx(paddingSpec.top, metrics, element);
      if (topPx !== null) warnIfFractional('padding-top', topPx, metrics.lineHeightPx);
    }
    if (paddingSpec.right) {
      const rightPx = resolveCssLengthPx(paddingSpec.right, metrics, element);
      if (rightPx !== null) warnIfFractional('padding-right', rightPx, metrics.charWidthPx);
    }
    if (paddingSpec.bottom) {
      const bottomPx = resolveCssLengthPx(paddingSpec.bottom, metrics, element);
      if (bottomPx !== null) warnIfFractional('padding-bottom', bottomPx, metrics.lineHeightPx);
    }
    if (paddingSpec.left) {
      const leftPx = resolveCssLengthPx(paddingSpec.left, metrics, element);
      if (leftPx !== null) warnIfFractional('padding-left', leftPx, metrics.charWidthPx);
    }
    const rawCols = cols || (widthPx ?? containerSize.width);
    const rawRows = rows || (heightPx ?? containerSize.height);
    const targetCols = Math.max(2, cols || snapToCols(rawCols, metrics));
    const targetRows = Math.max(2, rows || snapToRows(rawRows, metrics));
    const innerCols = Math.max(1, targetCols - snappedPadding.left - snappedPadding.right - 2);
    const normalized = normalizeText(text, tabs);
    const wrapped = wrapText(normalized, innerCols, wrap, overflow);
    const lines = wrapped.split('\n').length;
    const inferredRows = rows
      ? targetRows
      : Math.max(targetRows, lines + snappedPadding.top + snappedPadding.bottom + 2);
    return {
      padding: snappedPadding,
      cols: targetCols,
      rows: inferredRows,
      text: wrapped,
    };
  }, [
    containerSize.width,
    containerSize.height,
    metrics,
    text,
    tabs,
    wrap,
    overflow,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    width,
    height,
    cols,
    rows,
  ]);

  useEffect(() => {
    if (!layout) return;
    const envBaseUrl = (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_BOXES_API_BASE_URL;
    const baseUrl = apiBaseUrl ?? envBaseUrl ?? '';
    const resolvedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setPending(true);
      solveBox(
        {
          design,
          text: layout.text,
          size: { cols: layout.cols, rows: layout.rows },
          padding: layout.padding,
          align,
          tabs,
          eol: 'LF',
        },
        resolvedBase,
        controller.signal
      )
        .then((response) => {
          setBoxText(response.boxText || '');
          if (response.measured) setMeasured(response.measured);
          if (import.meta.env?.DEV && response.measured) {
            if (response.measured.cols !== layout.cols || response.measured.rows !== layout.rows) {
              // eslint-disable-next-line no-console
              console.warn(
                `[AsciiBox] ${design} snapped to ${response.measured.cols}x${response.measured.rows} (requested ${layout.cols}x${layout.rows}).`
              );
            }
          }
        })
        .catch(() => {
          setBoxText(layout.text);
        })
        .finally(() => setPending(false));
    }, debounceMs);
    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [layout, design, align, tabs, apiBaseUrl, debounceMs]);

  const displayCols = measured?.cols ?? layout?.cols;
  const displayRows = measured?.rows ?? layout?.rows;
  const boxStyle: CSSProperties = {
    width: displayCols ? `${displayCols * metrics.charWidthPx}px` : undefined,
    height: displayRows ? `${displayRows * metrics.lineHeightPx}px` : undefined,
    ...style,
  };

  return (
    <div ref={containerRef} className={cn('ascii-root relative', className)} style={boxStyle}>
      <pre className="ascii-pre">{boxText}</pre>
      {title && layout && (
        <div
          className={cn('pointer-events-none absolute font-mono text-[12px] font-semibold', titleClassName)}
          style={{
            left: `${(layout.padding.left + titleOffsetCols) * metrics.charWidthPx}px`,
            top: `${(layout.padding.top + titleOffsetRows) * metrics.lineHeightPx}px`,
          }}
        >
          {title}
        </div>
      )}
      {debug && displayCols && displayRows && (
        <div className="ascii-debug">{displayCols}x{displayRows}{pending ? '…' : ''}</div>
      )}
    </div>
  );
}
