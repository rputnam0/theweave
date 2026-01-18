import { AsciiBox } from './AsciiBox';
import designGlyphs from './ui/ascii/designGlyphs.json';

export function AsciiBoxesDemo() {
  const designs = Object.keys(designGlyphs).sort();
  const spans = [3, 4, 5, 6, 7];
  const heights = [140, 156, 168, 180, 196, 220, 240];
  const fontSizes = [12, 13, 14, 15, 16, 18, 20];
  const lineHeights = [16, 17, 18, 19, 20, 22, 24, 26];
  const weights = [500, 600, 700, 800];
  const paddings = ['0.5ch', '1ch', '1.5ch', '2ch', 6, 8, 10, 12];
  const palettes = [
    '#2563eb',
    '#14b8a6',
    '#f97316',
    '#4f46e5',
    '#ef4444',
    '#059669',
    '#0ea5e9',
    '#8b5cf6',
    '#d97706',
    '#a855f7',
    '#0f766e',
    '#ea580c',
  ];
  const apiBaseUrl = import.meta.env?.VITE_BOXES_API_BASE_URL || 'http://localhost:3005';
  const showDebug = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('debug') === '1'
    : false;
  return (
    <div className="bg-gray-100 min-h-screen p-4" style={{ overflowY: 'auto' }}>
      <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
        <div className="grid grid-cols-12 gap-4">
          {designs.map((design, index) => {
            const span = spans[index % spans.length];
            const height = heights[index % heights.length];
            const fontSize = fontSizes[index % fontSizes.length];
            const lineHeight = lineHeights[index % lineHeights.length];
            const fontWeight = weights[index % weights.length];
            const padding = paddings[index % paddings.length];
            const backgroundColor = palettes[index % palettes.length];
            const letterSpacing = index % 5 === 0 ? '0.6px' : undefined;
            const alignClass = index % 3 === 0 ? 'items-start' : index % 3 === 1 ? 'items-center' : 'items-end';
            return (
              <AsciiBox
                key={design}
                design={design}
                content={design}
                apiBaseUrl={apiBaseUrl}
                debug={showDebug}
                padding={padding as string | number}
                className={`rounded-xl shadow-lg flex justify-center text-white ${alignClass}`}
                style={{
                  gridColumn: `span ${span} / span ${span}`,
                  height: `${height}px`,
                  backgroundColor,
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}px`,
                  fontWeight,
                  letterSpacing,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
