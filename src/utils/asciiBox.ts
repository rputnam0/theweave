import { displayWidth } from '../components/ui/ascii/displayWidth';

export type BoxPadding = {
  x?: number;
  y?: number;
};

export type BoxMetrics = {
  cols: number;
  rows: number;
  padCols: number;
  padRows: number;
  lineHeight: number;
  charWidth: number;
};

export const DEFAULT_MEASURE_CHARS = '*-/\\_|~`+=#╭╮╰╯┌┐└┘─│═║';

const buildFontString = (style: CSSStyleDeclaration) => {
  const fontStyle = style.fontStyle || 'normal';
  const fontWeight = style.fontWeight || '400';
  const fontSize = style.fontSize || '16px';
  const fontFamily = style.fontFamily || 'monospace';
  return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
};

export const measureCharWidth = (font: string, chars: string) => {
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

const wrapParagraph = (text: string, width: number) => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current.length) {
      current = word;
      continue;
    }
    if ((displayWidth(current) + 1 + displayWidth(word)) <= width) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length) lines.push(current);
  return lines.join('\n');
};

export const wrapText = (text: string, width: number) => {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map((paragraph) => wrapParagraph(paragraph, width)).join('\n\n');
};

export const countWrappedLines = (text: string, width: number) => {
  if (!text.trim()) return 1;
  return wrapText(text, width).split('\n').length;
};

export const computeBoxMetrics = (
  element: HTMLElement,
  text: string,
  padding: BoxPadding = {},
  measureChars: string = DEFAULT_MEASURE_CHARS,
  forcedCols?: number,
  forcedRows?: number
): BoxMetrics => {
  const style = getComputedStyle(element);
  const font = buildFontString(style);
  const fontSize = parseFloat(style.fontSize) || 16;
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
  const charWidth = measureCharWidth(font, measureChars);

  const padX = padding.x ?? parseFloat(style.paddingLeft) || 0;
  const padY = padding.y ?? parseFloat(style.paddingTop) || 0;

  const padCols = Math.max(1, Math.round(padX / charWidth));
  const padRows = Math.max(1, Math.round(padY / lineHeight));

  let cols = forcedCols || Math.floor(element.clientWidth / charWidth);
  if (!cols || cols < 2) {
    const fallback = Math.max(10, Math.ceil(text.length / 2));
    cols = fallback + (padCols * 2) + 2;
  }

  let rows = forcedRows || Math.ceil(element.clientHeight / lineHeight);
  if (!rows || rows < 2) {
    const innerCols = Math.max(10, cols - (padCols * 2) - 2);
    const lines = countWrappedLines(text, innerCols);
    rows = lines + (padRows * 2) + 2;
  }

  return {
    cols,
    rows,
    padCols,
    padRows,
    lineHeight,
    charWidth,
  };
};
