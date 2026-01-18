import { CSSProperties, ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { computeInkFit, type InkFit } from './ascii/inkFit';
import designGlyphs from './ascii/designGlyphs.json';
import { detectFrame, maskTextToFrame } from './ascii/frame';
import { solveBox } from './ascii/boxesClient';
import { renderNodeToText } from './ascii/serializeContent';
import type { AsciiBoxAlign, AsciiBoxMeasured, AsciiBoxPadding, CssLength } from './ascii/types';

type WrapPolicy = 'off' | 'hard' | 'word';
type OverflowPolicy = 'clip' | 'ellipsis';

type AsciiBoxProps = {
  design: string;
  children?: ReactNode;
  content?: ReactNode;
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
  overlay?: ReactNode;
  overlayClassName?: string;
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

const getMeasureCharsForDesign = (design: string, fallback: string) =>
  designGlyphs[design as keyof typeof designGlyphs] || fallback;

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
  measureChars,
  overlay,
  overlayClassName,
  title,
  titleClassName,
  titleOffsetCols = 0,
  titleOffsetRows = 0,
}: AsciiBoxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLPreElement | null>(null);
  const frameMeasureRef = useRef<HTMLPreElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const [boxText, setBoxText] = useState('');
  const [measured, setMeasured] = useState<AsciiBoxMeasured | null>(null);
  const [pending, setPending] = useState(false);
  const [domFit, setDomFit] = useState<InkFit | null>(null);
  const [frameFit, setFrameFit] = useState<InkFit | null>(null);
  const rawContent = content ?? children;
  const text = useMemo(() => {
    if (typeof rawContent === 'string' || typeof rawContent === 'number') {
      return String(rawContent);
    }
    return renderNodeToText(rawContent);
  }, [rawContent]);
  const resolvedMeasureChars = useMemo(
    () => measureChars ?? getMeasureCharsForDesign(design, DEFAULT_MEASURE_CHARS),
    [measureChars, design]
  );
  const metrics = useAsciiCellMetrics(containerRef.current, resolvedMeasureChars);

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

  useEffect(() => {
    const element = overlayRef.current;
    if (!element) return;
    let frame = 0;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const next = entries[0].contentRect;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setOverlaySize({ width: next.width, height: next.height });
      });
    });
    observer.observe(element);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [overlay]);

  const layout = useMemo(() => {
    const element = containerRef.current;
    if (!element) return null;
    const charAdvancePx = metrics.charWidthPx + metrics.letterSpacingPx;
    const colsToPx = (count: number) =>
      (count * metrics.charWidthPx) + (Math.max(0, count - 1) * metrics.letterSpacingPx);
    const paddingSpec: AsciiBoxPadding = {
      top: paddingTop ?? paddingY ?? padding ?? 0,
      right: paddingRight ?? paddingX ?? padding ?? 0,
      bottom: paddingBottom ?? paddingY ?? padding ?? 0,
      left: paddingLeft ?? paddingX ?? padding ?? 0,
    };
    const widthPx = cols ? colsToPx(cols) : resolveCssLengthPx(width, metrics, element);
    const heightPx = rows ? rows * metrics.lineHeightPx : resolveCssLengthPx(height, metrics, element);
    if (widthPx !== null) warnIfFractional('width', widthPx, charAdvancePx);
    if (heightPx !== null) warnIfFractional('height', heightPx, metrics.lineHeightPx);
    const snappedPadding = snapPadding(paddingSpec, metrics, element);
    if (paddingSpec.top) {
      const topPx = resolveCssLengthPx(paddingSpec.top, metrics, element);
      if (topPx !== null) warnIfFractional('padding-top', topPx, metrics.lineHeightPx);
    }
    if (paddingSpec.right) {
      const rightPx = resolveCssLengthPx(paddingSpec.right, metrics, element);
      if (rightPx !== null) warnIfFractional('padding-right', rightPx, charAdvancePx);
    }
    if (paddingSpec.bottom) {
      const bottomPx = resolveCssLengthPx(paddingSpec.bottom, metrics, element);
      if (bottomPx !== null) warnIfFractional('padding-bottom', bottomPx, metrics.lineHeightPx);
    }
    if (paddingSpec.left) {
      const leftPx = resolveCssLengthPx(paddingSpec.left, metrics, element);
      if (leftPx !== null) warnIfFractional('padding-left', leftPx, charAdvancePx);
    }
    const effectiveWidth = Math.max(
      widthPx ?? containerSize.width,
      overlaySize.width
    );
    const effectiveHeight = Math.max(
      heightPx ?? containerSize.height,
      overlaySize.height
    );
    const rawCols = cols || effectiveWidth;
    const rawRows = rows || effectiveHeight;
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
    overlaySize.width,
    overlaySize.height,
  ]);

  const frameData = useMemo(() => {
    if (!boxText) return null;
    const frame = detectFrame(boxText);
    if (!frame) return null;
    const frameText = maskTextToFrame(boxText, frame);
    return { frame, frameText };
  }, [boxText]);

  const inkFit = useMemo(() => {
    if (!layout || !boxText) return null;
    const element = containerRef.current;
    if (!element) return null;
    const style = getComputedStyle(element);
    const fontStyle = style.fontStyle || 'normal';
    const fontWeight = style.fontWeight || '400';
    const fontSize = style.fontSize || '16px';
    const fontFamily = style.fontFamily || 'monospace';
    const fontString = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.font = fontString;
    const useLayoutTarget = Boolean(frameData);
    const fitCols = useLayoutTarget ? layout.cols : (measured?.cols ?? layout.cols);
    const fitRows = useLayoutTarget ? layout.rows : (measured?.rows ?? layout.rows);
    return computeInkFit({
      text: boxText,
      cols: fitCols,
      rows: fitRows,
      charWidthPx: metrics.charWidthPx,
      lineHeightPx: metrics.lineHeightPx,
      letterSpacingPx: metrics.letterSpacingPx,
      measureText: (value) => ctx.measureText(value),
    });
  }, [boxText, frameData, layout, metrics, measured]);

  const frameInkFit = useMemo(() => {
    if (!layout || !frameData) return null;
    const element = containerRef.current;
    if (!element) return null;
    const style = getComputedStyle(element);
    const fontStyle = style.fontStyle || 'normal';
    const fontWeight = style.fontWeight || '400';
    const fontSize = style.fontSize || '16px';
    const fontFamily = style.fontFamily || 'monospace';
    const fontString = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.font = fontString;
    return computeInkFit({
      text: frameData.frameText,
      cols: layout.cols,
      rows: layout.rows,
      charWidthPx: metrics.charWidthPx,
      lineHeightPx: metrics.lineHeightPx,
      letterSpacingPx: metrics.letterSpacingPx,
      measureText: (value) => ctx.measureText(value),
    });
  }, [frameData, layout, metrics]);

  const resolvedFit = useMemo(() => {
    if (!layout) return null;
    const primaryFit = frameFit || domFit || frameInkFit || inkFit;
    const secondaryFit = domFit || frameInkFit || inkFit;
    if (!primaryFit) return null;
    if (!secondaryFit || primaryFit === secondaryFit) return primaryFit;
    const fitCols = measured?.cols ?? layout.cols;
    const fitRows = measured?.rows ?? layout.rows;
    const targetWidth =
      (fitCols * metrics.charWidthPx) + (Math.max(0, fitCols - 1) * metrics.letterSpacingPx);
    const targetHeight = fitRows * metrics.lineHeightPx;
    const scoreFit = (fit: InkFit) => {
      const basis = frameInkFit || inkFit;
      if (!basis) return Number.POSITIVE_INFINITY;
      const minX = (basis.minX * fit.scaleX) + fit.offsetX;
      const maxX = (basis.maxX * fit.scaleX) + fit.offsetX;
      const minY = (basis.minY * fit.scaleY) + fit.offsetY;
      const maxY = (basis.maxY * fit.scaleY) + fit.offsetY;
      const overflow = Math.max(
        Math.max(0, -minX),
        Math.max(0, maxX - targetWidth),
        Math.max(0, -minY),
        Math.max(0, maxY - targetHeight)
      );
      return overflow;
    };
    const primaryOverflow = scoreFit(primaryFit);
    const secondaryOverflow = scoreFit(secondaryFit);
    if (secondaryOverflow + 0.25 < primaryOverflow) return secondaryFit;
    return primaryFit;
  }, [domFit, frameFit, frameInkFit, inkFit, layout, measured, metrics]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measureEl = measureRef.current;
    if (!container || !measureEl || !layout || !boxText) return;
    let frame = 0;
    frame = window.requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const measureRect = measureEl.getBoundingClientRect();
      const width = measureRect.width;
      const height = measureRect.height;
      if (width < 1 || height < 1 || containerRect.width < 1 || containerRect.height < 1) {
        setDomFit(null);
        return;
      }
      const minX = measureRect.left - containerRect.left;
      const minY = measureRect.top - containerRect.top;
      const maxX = minX + width;
      const maxY = minY + height;
      const scaleX = containerRect.width / width;
      const scaleY = containerRect.height / height;
      const offsetX = -minX * scaleX;
      const offsetY = -minY * scaleY;
      const nextFit = {
        minX,
        minY,
        maxX,
        maxY,
        inkWidth: width,
        inkHeight: height,
        scaleX,
        scaleY,
        offsetX,
        offsetY,
      };
      setDomFit((prev) => {
        if (
          prev &&
          Math.abs(prev.scaleX - nextFit.scaleX) < 0.002 &&
          Math.abs(prev.scaleY - nextFit.scaleY) < 0.002 &&
          Math.abs(prev.offsetX - nextFit.offsetX) < 0.5 &&
          Math.abs(prev.offsetY - nextFit.offsetY) < 0.5
        ) {
          return prev;
        }
        return nextFit;
      });
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [boxText, layout, containerSize, overlaySize]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const frameEl = frameMeasureRef.current;
    if (!container || !frameEl || !layout || !frameData) return;
    let frame = 0;
    frame = window.requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const measureRect = frameEl.getBoundingClientRect();
      const width = measureRect.width;
      const height = measureRect.height;
      if (width < 1 || height < 1 || containerRect.width < 1 || containerRect.height < 1) {
        setFrameFit(null);
        return;
      }
      const minX = measureRect.left - containerRect.left;
      const minY = measureRect.top - containerRect.top;
      const maxX = minX + width;
      const maxY = minY + height;
      const scaleX = containerRect.width / width;
      const scaleY = containerRect.height / height;
      const offsetX = -minX * scaleX;
      const offsetY = -minY * scaleY;
      const nextFit = {
        minX,
        minY,
        maxX,
        maxY,
        inkWidth: width,
        inkHeight: height,
        scaleX,
        scaleY,
        offsetX,
        offsetY,
      };
      setFrameFit((prev) => {
        if (
          prev &&
          Math.abs(prev.scaleX - nextFit.scaleX) < 0.002 &&
          Math.abs(prev.scaleY - nextFit.scaleY) < 0.002 &&
          Math.abs(prev.offsetX - nextFit.offsetX) < 0.5 &&
          Math.abs(prev.offsetY - nextFit.offsetY) < 0.5
        ) {
          return prev;
        }
        return nextFit;
      });
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [frameData, layout, containerSize, overlaySize]);

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

  const hasExplicitSize = cols !== undefined || rows !== undefined || width !== undefined || height !== undefined;
  const displayCols = measured?.cols ?? layout?.cols;
  const displayRows = measured?.rows ?? layout?.rows;
  const boxStyle: CSSProperties = {
    ...(hasExplicitSize && layout
      ? {
          width: `${(layout.cols * metrics.charWidthPx) + (Math.max(0, layout.cols - 1) * metrics.letterSpacingPx)}px`,
          height: `${layout.rows * metrics.lineHeightPx}px`,
        }
      : null),
    ...(overlaySize.width || overlaySize.height
      ? {
          minWidth: overlaySize.width ? `${overlaySize.width}px` : undefined,
          minHeight: overlaySize.height ? `${overlaySize.height}px` : undefined,
        }
      : null),
    ...style,
  };

  return (
    <div ref={containerRef} className={cn('ascii-root relative', className)} style={boxStyle}>
      <pre
        className="ascii-pre"
        style={
          resolvedFit
            ? {
                transform: `translate(${resolvedFit.offsetX}px, ${resolvedFit.offsetY}px) scale(${resolvedFit.scaleX}, ${resolvedFit.scaleY})`,
                transformOrigin: 'top left',
              }
            : undefined
        }
      >
        {boxText}
      </pre>
      <pre ref={measureRef} className="ascii-pre ascii-pre-measure" aria-hidden="true">
        {boxText}
      </pre>
      {frameData && (
        <pre ref={frameMeasureRef} className="ascii-pre ascii-pre-measure" aria-hidden="true">
          {frameData.frameText}
        </pre>
      )}
      {overlay && (
        <div ref={overlayRef} className={cn('ascii-overlay', overlayClassName)}>
          {overlay}
        </div>
      )}
      {title && layout && (
        <div
          className={cn('pointer-events-none absolute font-mono text-[12px] font-semibold', titleClassName)}
          style={{
            left: `${(layout.padding.left + titleOffsetCols) * (metrics.charWidthPx + metrics.letterSpacingPx)}px`,
            top: `${(layout.padding.top + titleOffsetRows) * metrics.lineHeightPx}px`,
          }}
        >
          {title}
        </div>
      )}
      {debug && displayCols && displayRows && (
        <div className="ascii-debug">{displayCols}x{displayRows}{pending ? '…' : ''}</div>
      )}
      {debug && frameData && (
        <div
          className="ascii-frame-debug"
          style={{
            left: `${frameData.frame.left * (metrics.charWidthPx + metrics.letterSpacingPx)}px`,
            top: `${frameData.frame.top * metrics.lineHeightPx}px`,
            width: `${(frameData.frame.right - frameData.frame.left + 1) * (metrics.charWidthPx + metrics.letterSpacingPx)}px`,
            height: `${(frameData.frame.bottom - frameData.frame.top + 1) * metrics.lineHeightPx}px`,
          }}
        />
      )}
    </div>
  );
}
