const http = require('node:http');
const url = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

const { renderBox, getAllowedDesigns } = require('./boxesRenderer');
const { displayWidth } = require('./displayWidth');
const { measureBox } = require('./measureBox');

const DEFAULT_PORT = Number(process.env.PORT || 3005);
const DEFAULT_COLS = 64;
const PROTOTYPE_PADDING_PX = 24;
const FONT_SIZE_PX = 11;
const LINE_HEIGHT_PX = 13.2;
const CHAR_WIDTH_PX = 6.6;
const DEFAULT_PADDING_COLS = Math.max(1, Math.round(PROTOTYPE_PADDING_PX / CHAR_WIDTH_PX));
const DEFAULT_PADDING_ROWS = Math.max(1, Math.round(PROTOTYPE_PADDING_PX / LINE_HEIGHT_PX));
const DIST_DIR = path.resolve(__dirname, '..', 'build');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function wrapParagraph(text, width) {
  const words = text.trim().split(/\s+/);
  const lines = [];
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
}

function wrapText(text, width) {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map((paragraph) => wrapParagraph(paragraph, width)).join('\n\n');
}

function getParamInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function serveStaticFile(req, res) {
  if (!fs.existsSync(DIST_DIR)) return false;

  const parsed = url.parse(req.url || '/');
  const pathname = parsed.pathname || '/';
  const filePath = pathname === '/' ? path.join(DIST_DIR, 'index.html') : path.join(DIST_DIR, pathname);
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(400);
    res.end();
    return true;
  }

  if (!fs.existsSync(filePath)) return false;

  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === '.js'
    ? 'application/javascript'
    : ext === '.css'
      ? 'text/css'
      : ext === '.html'
        ? 'text/html'
        : 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

async function handleRenderRequest(req, res, body) {
  let payload = null;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid_json' }));
    return;
  }

  const cols = getParamInt(payload.cols, DEFAULT_COLS);
  const rows = Number.isFinite(payload.rows) ? Number(payload.rows) : undefined;
  const paddingCols = getParamInt(payload.pad, DEFAULT_PADDING_COLS);
  const paddingRows = getParamInt(payload.padRows, DEFAULT_PADDING_ROWS);
  const padding = payload.padding || null;
  const design = payload.design || 'simple';
  const text = typeof payload.text === 'string' ? payload.text : '';
  const align = payload.align;
  const tabs = Number.isFinite(payload.tabs) ? Number(payload.tabs) : undefined;
  const eol = payload.eol || 'LF';

  const resolvedPadding = padding && typeof padding === 'object'
    ? {
      top: getParamInt(padding.top, paddingRows),
      right: getParamInt(padding.right, paddingCols),
      bottom: getParamInt(padding.bottom, paddingRows),
      left: getParamInt(padding.left, paddingCols),
    }
    : {
      top: paddingRows,
      right: paddingCols,
      bottom: paddingRows,
      left: paddingCols,
    };
  const wrapped = text;

  try {
    const { boxText } = await renderBox({
      text: wrapped,
      design,
      align,
      padding: resolvedPadding,
      size: { cols, rows },
      tabs,
      eol,
      configVersion: 'local',
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ boxText, measured: measureBox(boxText) }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'render_failed', detail: err.message }));
  }
}

async function handleRequest(req, res) {
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url.startsWith('/api/box')) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString('utf8');
    });
    req.on('end', () => {
      handleRenderRequest(req, res, body);
    });
    return;
  }

  if (req.url.startsWith('/api/designs')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ designs: getAllowedDesigns() }));
    return;
  }

  if (serveStaticFile(req, res)) return;

  const parsed = url.parse(req.url, true);
  const cols = getParamInt(parsed.query.cols, DEFAULT_COLS);
  const paddingCols = getParamInt(parsed.query.pad, DEFAULT_PADDING_COLS);
  const paddingRows = getParamInt(parsed.query.padRows, DEFAULT_PADDING_ROWS);

  const message = 'The Weave Archive: a parchment log rendered server-side with boxes.';
  const innerCols = Math.max(10, cols - (paddingCols * 2) - 2);
  const wrapped = wrapText(message, innerCols);

  try {
    const { boxText } = await renderBox({
      text: wrapped,
      design: 'parchment',
      align: 'hc',
      padding: {
        left: paddingCols,
        right: paddingCols,
        top: paddingRows,
        bottom: paddingRows,
      },
      size: { cols },
      configVersion: 'local',
    });

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>ASCII Box Renderer</title>
    <style>
      body {
        margin: 0;
        padding: 32px;
        background: #e0e0d0;
        color: #111;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      }
      .card {
        max-width: ${cols}ch;
        margin: 0 auto;
      }
      pre {
        white-space: pre;
        line-height: 1.2;
        font-size: 16px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <pre>${escapeHtml(boxText)}</pre>
    </div>
  </body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Render failed: ${err.message}`);
  }
}

const server = http.createServer((req, res) => {
  handleRequest(req, res);
});

server.listen(DEFAULT_PORT, () => {
  console.log(`ASCII box renderer running at http://localhost:${DEFAULT_PORT}`);
});
