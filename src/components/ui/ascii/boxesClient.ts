import type { AsciiBoxMeasured, AsciiBoxPaddingCells, AsciiBoxSize } from './types';

const DEFAULT_CACHE_LIMIT = 200;
const DEFAULT_SOLVER_ITERATIONS = 5;

type BoxesRequest = {
  design: string;
  text: string;
  size: AsciiBoxSize;
  padding: AsciiBoxPaddingCells;
  align?: string;
  tabs?: number;
  eol?: 'LF';
};

type BoxesResponse = {
  boxText: string;
  measured?: AsciiBoxMeasured;
  warnings?: string[];
};

class LruCache {
  private limit: number;
  private map: Map<string, BoxesResponse>;

  constructor(limit = DEFAULT_CACHE_LIMIT) {
    this.limit = limit;
    this.map = new Map();
  }

  get(key: string) {
    const value = this.map.get(key);
    if (!value) return undefined;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: string, value: BoxesResponse) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    if (this.map.size > this.limit) {
      const firstKey = this.map.keys().next().value;
      if (firstKey) this.map.delete(firstKey);
    }
  }
}

const cache = new LruCache();

const buildCacheKey = (request: BoxesRequest) => JSON.stringify(request);

const normalizeText = (text: string, tabs: number) => {
  const normalized = text.replace(/\r\n?/g, '\n');
  if (!tabs || tabs <= 0) return normalized.replace(/\t/g, '');
  const tabSpaces = ' '.repeat(tabs);
  return normalized.replace(/\t/g, tabSpaces);
};

export const renderBoxRequest = async (
  request: BoxesRequest,
  apiBaseUrl: string,
  signal?: AbortSignal
): Promise<BoxesResponse> => {
  const payload = {
    design: request.design,
    cols: request.size.cols,
    rows: request.size.rows,
    padding: request.padding,
    align: request.align,
    tabs: request.tabs,
    eol: request.eol || 'LF',
    text: normalizeText(request.text, request.tabs || 8),
  };
  const cacheKey = buildCacheKey({ ...request, text: payload.text });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${apiBaseUrl}/api/box`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Boxes API error: ${response.status}`);
  }
  const data = await response.json();
  const result = {
    boxText: data.boxText || '',
    measured: data.measured,
    warnings: data.warnings,
  };
  cache.set(cacheKey, result);
  return result;
};

export const solveBox = async (
  request: BoxesRequest,
  apiBaseUrl: string,
  signal?: AbortSignal,
  maxIterations: number = DEFAULT_SOLVER_ITERATIONS
): Promise<BoxesResponse> => {
  let targetCols = request.size.cols;
  let targetRows = request.size.rows;
  let currentCols = targetCols;
  let currentRows = targetRows;
  let lastResponse: BoxesResponse | null = null;

  for (let i = 0; i < maxIterations; i += 1) {
    const response = await renderBoxRequest(
      { ...request, size: { cols: currentCols, rows: currentRows } },
      apiBaseUrl,
      signal
    );
    lastResponse = response;
    const measuredCols = response.measured?.cols ?? currentCols;
    const measuredRows = response.measured?.rows ?? currentRows;
    if (measuredCols === targetCols && measuredRows === targetRows) return response;

    const deltaCols = targetCols - measuredCols;
    const deltaRows = targetRows - measuredRows;
    const nextCols = Math.max(2, currentCols + deltaCols);
    const nextRows = Math.max(2, currentRows + deltaRows);
    if (nextCols === currentCols && nextRows === currentRows) break;
    currentCols = nextCols;
    currentRows = nextRows;
  }

  return lastResponse || { boxText: '', warnings: ['No response from solver.'] };
};
