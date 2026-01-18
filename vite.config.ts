
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { renderBox } = require('./server/boxesRenderer');
const { measureBox } = require('./server/measureBox');

const PROTOTYPE_PADDING_PX = 24;
const FONT_SIZE_PX = 11;
const LINE_HEIGHT_PX = 13.2;
const CHAR_WIDTH_PX = 6.6;
const DEFAULT_PADDING_COLS = Math.max(1, Math.round(PROTOTYPE_PADDING_PX / CHAR_WIDTH_PX));
const DEFAULT_PADDING_ROWS = Math.max(1, Math.round(PROTOTYPE_PADDING_PX / LINE_HEIGHT_PX));

const wrapParagraph = (text: string, width: number) => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current.length) {
      current = word;
      continue;
    }
    if ((current.length + 1 + word.length) <= width) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length) lines.push(current);
  return lines.join('\n');
};

const wrapText = (text: string, width: number) => {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map((paragraph) => wrapParagraph(paragraph, width)).join('\n\n');
};

const boxesApiPlugin = () => ({
  name: 'boxes-api',
  configureServer(server: any) {
    server.middlewares.use('/api/box', (req: any, res: any, next: any) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end();
        return;
      }

      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString('utf8');
      });

      req.on('end', async () => {
        let payload: any = null;
        try {
          payload = JSON.parse(body);
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid_json' }));
          return;
        }

        const cols = Number.isFinite(payload.cols) ? payload.cols : 64;
        const rows = Number.isFinite(payload.rows) ? payload.rows : undefined;
        const paddingCols = Number.isFinite(payload.pad) ? payload.pad : DEFAULT_PADDING_COLS;
        const paddingRows = Number.isFinite(payload.padRows) ? payload.padRows : DEFAULT_PADDING_ROWS;
        const design = payload.design || 'simple';
        const text = typeof payload.text === 'string' ? payload.text : '';
        const align = payload.align;

        const innerCols = Math.max(10, cols - (paddingCols * 2) - 2);
        const wrapped = wrapText(text, innerCols);

        try {
          const { boxText } = await renderBox({
            text: wrapped,
            design,
            align,
            padding: {
              left: paddingCols,
              right: paddingCols,
              top: paddingRows,
              bottom: paddingRows,
            },
            size: { cols, rows },
            configVersion: 'local',
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ boxText, measured: measureBox(boxText) }));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'render_failed', detail: err.message }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), boxesApiPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/frontend/**/*.test.ts', 'tests/frontend/**/*.test.tsx'],
    globals: true,
  },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/2581b88cdeb9018ce6635f351816b3af7eafeaac.png': path.resolve(__dirname, './src/assets/2581b88cdeb9018ce6635f351816b3af7eafeaac.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });
