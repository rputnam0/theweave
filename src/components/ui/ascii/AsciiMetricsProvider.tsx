import { PropsWithChildren, useLayoutEffect, useRef, useState } from 'react';
import { AsciiMetricsContext } from './metricsContext';
import { DEFAULT_MEASURE_CHARS } from './measure';

type AsciiMetricsProviderProps = PropsWithChildren<{
  measureChars?: string;
  className?: string;
}>;

export function AsciiMetricsProvider({
  children,
  measureChars = DEFAULT_MEASURE_CHARS,
  className,
}: AsciiMetricsProviderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = useState({ charWidthPx: 8, lineHeightPx: 16 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const style = getComputedStyle(element);
    const fontStyle = style.fontStyle || 'normal';
    const fontWeight = style.fontWeight || '400';
    const fontSize = style.fontSize || '16px';
    const fontFamily = style.fontFamily || 'monospace';
    const fontString = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let max = 8;
    if (ctx) {
      ctx.font = fontString;
      for (const ch of measureChars) {
        const width = ctx.measureText(ch).width;
        if (width > max) max = width;
      }
    }
    const fontSizePx = parseFloat(style.fontSize) || 16;
    const lineHeightPx = parseFloat(style.lineHeight) || fontSizePx * 1.2;
    setMetrics({ charWidthPx: max, lineHeightPx });
  }, [measureChars]);

  return (
    <div ref={ref} className={className}>
      <AsciiMetricsContext.Provider value={metrics}>
        {children}
      </AsciiMetricsContext.Provider>
    </div>
  );
}
