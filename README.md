
  # theweave.quest

  This is a code bundle for theweave.quest. The original project is available at https://www.figma.com/design/MIj7eXAw5hFGTtqxHnDszz/theweave.quest.

  ## ASCII Box Helper

  The ASCII box helper renders layout intent from React into deterministic ASCII box output using the server-side `boxes` renderer. Frontend code defines size, padding, and alignment, and the helper snaps those values to character-cell units, calls `/api/box`, and renders the ASCII inside the same layout box. If you pass explicit `cols`/`rows`/`width`/`height`, the helper uses those; otherwise it derives size from the container.

  ### Typical workflow

  1) Build layout the normal React + Tailwind way (`grid`, `h-*`, `w-full`, `max-w-*`, etc.).
  2) Swap a normal wrapper `<div>` for `<AsciiBox>`.
  3) Keep the same `className` so size and position stay identical.
  4) Set `design` and `content` (or children) to render ASCII.

  Minimal example:
  ```tsx
  import { AsciiBox } from './components/AsciiBox';

  <AsciiBox
    design="simple"
    className="h-48 bg-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg"
    content="Box 1"
  />;
  ```

  ### Quick start

  1) Start the boxes server:
  ```
  npm run server:start
  ```

  2) Start Vite:
  ```
  npm run dev
  ```

  3) Render a box:
  ```tsx
  import { AsciiBox } from './components/AsciiBox';

  <AsciiBox
    design="simple"
    width="42ch"
    padding="1ch"
    align="hcvc"
    content="Hello from the archive."
  />;
  ```

  ### Props
  - `design` (string, required): `boxes` design name (loaded from `boxes-config` server-side).
  - `content` / `children` (ReactNode): text or JSX to render; JSX is flattened to text.
  - `width` / `height` (CssLength): layout intent; `ch` and `lh` provide exact column/row sizing.
  - `padding`, `paddingX`, `paddingY`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` (CssLength): per-side padding intent.
  - `align` (AsciiBoxAlign): maps to `boxes -a` (default `hcvc`).
  - `tabs` (number): tab width (default `8`).
  - `wrap` (`'off' | 'hard' | 'word'`): wrap policy (default `hard`).
  - `overflow` (`'clip' | 'ellipsis'`): when wrapping is off and text exceeds width.
  - `cols` / `rows` (number): explicit cell size override.
  - `apiBaseUrl` (string): override `VITE_BOXES_API_BASE_URL`.
  - `debounceMs` (number): resize debounce (default `80`).
  - `debug` (boolean): overlays measured cols/rows and frame bounds in dev.
  - `title`, `titleClassName`, `titleOffsetCols`, `titleOffsetRows`: overlay label inside the box.

  ### How it works (short)
  - Observes the container size and converts JSX content to plain text.
  - Measures font metrics to convert pixels to ASCII cell columns/rows.
  - Snaps layout intent (size/padding) to whole cells and wraps text to fit.
  - Calls `/api/box` (iterating until the measured size matches the target).
  - Detects the primary frame (box border) and aligns it to the CSS box, allowing decorative art to spill outside the frame.
  - Renders the ASCII in a `<pre>` and applies a fit transform so the frame lands on the CSS edges, even with custom font size/weight/line-height.

  Details: see `ascii-box-solver.md`.

  ### JSX serialization rules
  JSX is converted to text with these defaults:
  - Headings (`h1`-`h6`): uppercased and separated by blank lines.
  - Paragraph-like blocks (`div`, `section`, `article`, `p`, etc.): separated by blank lines.
  - Lists: `li` becomes `- item`.
  - `br`: newline.
  - `hr`: `---`.
  - Inline emphasis:
    - `strong`/`b` -> `**text**`
    - `em`/`i` -> `_text_`
    - `code` -> `` `text` ``
  - Links (`a`): `label (href)` if `href` exists.

  ### Server API
  `POST /api/box`
  ```json
  {
    "design": "simple",
    "cols": 60,
    "rows": 10,
    "padding": { "top": 1, "right": 2, "bottom": 1, "left": 2 },
    "align": "hcvc",
    "tabs": 8,
    "eol": "LF",
    "text": "Hello\nWorld"
  }
  ```

  Response:
  ```json
  {
    "boxText": "...",
    "measured": { "cols": 60, "rows": 10 }
  }
  ```

  `GET /api/designs` returns the allowlisted designs.

  ### Demo
  Dev-only demo route:
  ```
  http://localhost:3001/?demo=ascii-boxes
  ```
  Debug overlay:
  ```
  http://localhost:3001/?demo=ascii-boxes&debug=1
  ```

  ### Offline tooling
  - `scripts/extract-box-glyphs.mjs` generates per-design glyph sets -> `src/components/ui/ascii/designGlyphs.json`
  - `scripts/extract-box-samples.mjs` generates per-design samples -> `src/components/ui/ascii/designSamples.json`

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
