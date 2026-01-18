const { spawn } = require('node:child_process');
const path = require('node:path');

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '..', 'boxes', 'boxes', 'boxes-config');
const DEFAULT_TIMEOUT_MS = 200;
const DEFAULT_MAX_OUTPUT_BYTES = 200_000;
const DEFAULT_MAX_TEXT_LENGTH = 10_000;
const DEFAULT_MAX_LINES = 200;
const DEFAULT_MAX_COLS = 200;
const DEFAULT_MAX_ROWS = 200;
const DEFAULT_CACHE_LIMIT = 200;

const DESIGN_ALLOWLIST = new Set([
  'simple',
  'parchment',
  'ansi',
  'ansi-rounded',
  'ansi-double',
  'boxquote',
  'shell',
]);

const ALIGN_REGEX = /^(h[clr])?(v[tcb])?(j[clr])?$|^[lcr]$/;
const EOL_ALLOWLIST = new Set(['LF']);

class LruCache {
  constructor(limit = DEFAULT_CACHE_LIMIT) {
    this.limit = limit;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    if (this.map.size > this.limit) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
  }
}

const cache = new LruCache();

function normalizePadding(padding) {
  if (!padding) return null;
  const parts = [];
  if (Number.isInteger(padding.top)) parts.push(`t${padding.top}`);
  if (Number.isInteger(padding.right)) parts.push(`r${padding.right}`);
  if (Number.isInteger(padding.bottom)) parts.push(`b${padding.bottom}`);
  if (Number.isInteger(padding.left)) parts.push(`l${padding.left}`);
  return parts.length ? parts.join('') : null;
}

function normalizeSize(size) {
  if (!size) return null;
  const cols = Number.isInteger(size.cols) ? size.cols : null;
  const rows = Number.isInteger(size.rows) ? size.rows : null;
  if (cols && rows) return `${cols}x${rows}`;
  if (cols) return `${cols}`;
  if (rows) return `x${rows}`;
  return null;
}

function validateParams(params) {
  if (!params || typeof params.text !== 'string') {
    throw new Error('text is required');
  }
  if (params.text.length > DEFAULT_MAX_TEXT_LENGTH) {
    throw new Error('text too long');
  }

  const lineCount = params.text.split(/\r\n|\r|\n/).length;
  if (lineCount > DEFAULT_MAX_LINES) {
    throw new Error('too many lines');
  }

  if (!DESIGN_ALLOWLIST.has(params.design)) {
    throw new Error(`design not allowed: ${params.design}`);
  }

  if (params.align && !ALIGN_REGEX.test(params.align)) {
    throw new Error('invalid align value');
  }

  if (params.tabs !== undefined && !Number.isInteger(params.tabs)) {
    throw new Error('tabs must be integer');
  }

  if (params.eol && !EOL_ALLOWLIST.has(params.eol)) {
    throw new Error('invalid eol value');
  }

  if (params.size) {
    if (Number.isInteger(params.size.cols) && params.size.cols > DEFAULT_MAX_COLS) {
      throw new Error('cols too large');
    }
    if (Number.isInteger(params.size.rows) && params.size.rows > DEFAULT_MAX_ROWS) {
      throw new Error('rows too large');
    }
  }
}

function buildArgs(params, configPath) {
  const args = [
    '--no-color',
    '-n', 'UTF-8',
    '-f', configPath,
    '-d', params.design,
  ];

  if (params.eol) {
    args.push('-e', params.eol);
  }

  if (params.align) {
    args.push('-a', params.align);
  }

  if (Number.isInteger(params.tabs)) {
    args.push('-t', String(params.tabs));
  }

  const paddingSpec = normalizePadding(params.padding);
  if (paddingSpec) {
    args.push('-p', paddingSpec);
  }

  const sizeSpec = normalizeSize(params.size);
  if (sizeSpec) {
    args.push('-s', sizeSpec);
  }

  return args;
}

function buildCacheKey(params, configVersion) {
  const sizeSpec = normalizeSize(params.size) || '';
  const paddingSpec = normalizePadding(params.padding) || '';
  const align = params.align || '';
  const tabs = Number.isInteger(params.tabs) ? String(params.tabs) : '';
  const eol = params.eol || '';
  return [
    'boxes',
    configVersion || 'v1',
    params.design,
    align,
    tabs,
    eol,
    paddingSpec,
    sizeSpec,
    params.text,
  ].join('|');
}

function spawnBoxes(args, input, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn('boxes', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let outputBytes = 0;
    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      outputBytes += chunk.length;
      if (outputBytes > DEFAULT_MAX_OUTPUT_BYTES) {
        child.kill('SIGKILL');
        return;
      }
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (timedOut) {
        reject(new Error('boxes timeout'));
        return;
      }
      if (code !== 0) {
        reject(new Error(`boxes exit ${code}: ${stderr.trim()}`));
        return;
      }
      resolve(stdout);
    });

    child.stdin.end(input, 'utf8');
  });
}

async function renderBox(params) {
  validateParams(params);

  const configPath = params.configPath || process.env.BOXES_CONFIG_PATH || DEFAULT_CONFIG_PATH;
  const cacheKey = buildCacheKey(params, params.configVersion);
  const cached = cache.get(cacheKey);
  if (cached) {
    return { boxText: cached, meta: { cacheHit: true, design: params.design } };
  }

  const args = buildArgs(params, configPath);
  const start = Date.now();
  const boxText = await spawnBoxes(args, params.text, params.timeoutMs || DEFAULT_TIMEOUT_MS);
  const renderMs = Date.now() - start;

  cache.set(cacheKey, boxText);
  return {
    boxText,
    meta: {
      cacheHit: false,
      renderMs,
      design: params.design,
      cols: params.size?.cols,
      rows: params.size?.rows,
    },
  };
}

module.exports = {
  renderBox,
  getAllowedDesigns: () => Array.from(DESIGN_ALLOWLIST),
  _internal: {
    buildArgs,
    normalizePadding,
    normalizeSize,
  },
};
