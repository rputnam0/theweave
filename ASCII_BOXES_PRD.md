# ASCII Boxes Server-Side Rendering PRD

## Overview
We will integrate the open-source `boxes` renderer into the server render pipeline to generate deterministic ASCII/Unicode box art for UI content. Rendering happens server-side only; no client-side rerendering on resize or typing. The output is injected into HTML as `<pre>` blocks to preserve the ASCII aesthetic across the product.

## Goals
- Use `boxes` to render ASCII borders server-side for reusable UI components.
- Avoid shipping GPL code to the browser by keeping `boxes` execution on the server.
- Provide a deterministic, safe, and cached rendering pipeline.
- Keep layout predictable using character-based widths (`ch`) and pre-wrapping.

## Non-goals
- Client-side, resize-driven box recomputation.
- User-supplied box designs/config files.
- Live editing/typing workflows.

## Target Stack
- Runtime: Node.js (fits current JS frontend stack)
- Deployment: single Docker container
- Rendering mode: in-process spawn (`child_process.spawn`)

## Requirements
### R1: Docker Build (Spec 1)
- Build `boxes` from source in the container.
- Install binary to `/usr/local/bin/boxes`.
- Bundle pinned `boxes-config` at `/opt/boxes/boxes-config`.
- Use Debian-based Node image and required build deps:
  `build-essential`, `flex`, `bison`, `libunistring-dev`, `libpcre2-dev`, `libncurses-dev`.

### R2: Renderer Module (Spec 2)
- Implement `renderBox(params)` returning `{ boxText, meta }`.
- Validate inputs (allowlisted designs, size/padding/align limits).
- Spawn `boxes` with:
  `--no-color -n UTF-8 -f /opt/boxes/boxes-config -d <design>`
  plus optional `-a`, `-p`, `-s`.
- Enforce timeouts and output caps.
- Add in-memory LRU cache keyed by versioned config and inputs.
- Provide fallback output on failure.

### R3: Internal API Contract (Spec 3)
Inputs:
- `text`, `design`
- optional `size {cols, rows}`, `padding {t,r,b,l}`, `align`, `mode`
Outputs:
- `boxText`
- `meta { cacheHit, renderMs, design, cols?, rows? }`

## SSR Integration
- Pre-wrap text to a known width before calling `renderBox`.
- Use `<pre class="AsciiBox">` with fixed monospace font and line height.
- Set container widths in `ch` units to align with server-specified sizes.
- HTML-escape box output when injecting.

## Safety & Limits
- `text.length <= 10k`, `lines <= 200`
- `cols/rows <= 200`
- output <= 200KB
- per-render timeout 100–250ms
- no shell invocation; argv array only

## Observability
Track:
- render count, cache hit rate, duration (p50/p95/p99), timeouts, errors
Logs:
- cache key hash prefix, design, size, renderMs, exit code

## Success Criteria
- Renderer produces identical output to local `boxes` CLI for a fixed set of inputs.
- SSR pages render boxed content without layout drift at target widths (`ch` based).
- No SSR failures due to renderer errors; fallback paths verified.
- Cache hit rate >= 60% on repeat renders in staging.
- End-to-end render time impact <= 50ms p95 per boxed element.

## Testing Requirements
- Unit tests for input validation and argv construction.
- Snapshot tests comparing renderer output to `boxes` CLI for fixed fixtures.
- Integration test: SSR route renders `<pre>` with boxed content.
- Performance test: render 100 boxes under load within timeout limits.
- CI must pass all tests before merge.

## Milestones / Work Items
1. Add Docker build stage for `boxes` and include config file.
2. Implement `renderBox` module with validation + caching + spawn wrapper.
3. Add server route or SSR hook that calls `renderBox`.
4. Update UI templates to inject boxed `<pre>` output.
5. QA on multiple viewports and content lengths; verify deterministic output.

## Risks & Mitigations
- GPL-3.0 licensing: confirm distribution policy before shipping.
- Renderer failure: fallback output to avoid SSR errors.
- Layout drift: lock font + line height and use `ch`-based sizing.
