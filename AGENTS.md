# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React project with source code under `src/`.
- `src/main.tsx` bootstraps the app and mounts `src/App.tsx`.
- `src/components/` holds feature components and `src/components/ui/` contains shared UI primitives.
- `src/styles/` contains global styles; `src/index.css` is the compiled Tailwind output.
- `src/assets/` stores static assets (images, etc.).
- `index.html` is the Vite entry document.

## Build, Test, and Development Commands
- `npm i`: install dependencies.
- `npm run dev`: start the Vite dev server (opens a browser on port 3000 by default).
- `npm run build`: produce a production build in `build/`.

## Coding Style & Naming Conventions
- TypeScript + React (TSX). Match local file conventions; components are PascalCase files like `CampaignNavigation.tsx`.
- Use single quotes where already used in a file; keep semicolons consistent with surrounding code.
- UI helpers live in `src/components/ui/` and shared utilities in `src/components/ui/utils.ts`.
- Styles are mostly Tailwind utility classes in JSX; custom CSS lives in `src/styles/` or `src/index.css`.

## Testing Guidelines
No testing framework or test directory is configured in this repo. If you add tests, document the runner and add scripts in `package.json`.

## Commit & Pull Request Guidelines
No Git history is available in this workspace, so commit conventions are not defined. Use concise, imperative messages (e.g., `Add quest log filters`).
For PRs:
- Include a clear description of behavior changes.
- Add before/after screenshots for UI changes.
- Link related issues or Figma frames when available.

## Configuration & Assets
Vite config lives in `vite.config.ts`, including path aliases and build output (`build/`). Keep new assets under `src/assets/` and reference them with relative imports or existing aliases.
