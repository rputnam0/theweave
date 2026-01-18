import { AsciiBox } from './AsciiBox';
import { AsciiMetricsProvider } from './ui/ascii/AsciiMetricsProvider';

const JS_SNIPPET = [
  'const quest = {',
  '  id: "weave-01",',
  '  status: "active",',
  '  steps: ["map", "tokens", "ritual"],',
  '};',
  '',
  'export const advanceQuest = (state) => ({',
  '  ...state,',
  '  step: state.step + 1,',
  '});',
].join('\n');

const HOOK_SNIPPET = [
  'import { useMemo } from "react";',
  '',
  'export const useGlyphs = (glyphs) =>',
  '  useMemo(() => glyphs.join(""), [glyphs]);',
].join('\n');

const UTIL_SNIPPET = [
  'const clamp = (value, min, max) =>',
  '  Math.min(max, Math.max(min, value));',
  '',
  'export const toCols = (px, charWidth) =>',
  '  clamp(Math.round(px / charWidth), 2, 200);',
].join('\n');

export function AsciiBoxesDemo() {
  return (
    <AsciiMetricsProvider className="ascii-root h-full w-full">
      <div className="h-full w-full overflow-auto bg-[radial-gradient(circle_at_top,_#f1f0e6,_#d8d1bf)] p-6">
        <div className="mx-auto flex w-full max-w-[90ch] flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AsciiBox
              design="simple"
              width="42ch"
              height="14lh"
              padding="1ch"
              wrap="hard"
              content={JS_SNIPPET}
              className="bg-[#f8f2e3] text-[#231f1a] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.35)]"
              title="Quest State"
              titleClassName="bg-[#f8f2e3] text-[#231f1a]"
            />
            <AsciiBox
              design="ansi-rounded"
              width="42ch"
              height="14lh"
              padding="1ch"
              wrap="hard"
              content={HOOK_SNIPPET}
              className="bg-[#eef3f7] text-[#102a3a] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.35)]"
              title="Hook"
              titleClassName="bg-[#eef3f7] text-[#102a3a]"
            />
          </div>
          <AsciiBox
            design="parchment"
            width="86ch"
            height="18lh"
            padding="2ch"
            wrap="word"
            content={UTIL_SNIPPET}
            className="bg-[#f7efe0] text-[#30281e] shadow-[0_18px_45px_-30px_rgba(0,0,0,0.4)]"
            title="Utilities"
            titleClassName="bg-[#f7efe0] text-[#30281e]"
          />
        </div>
      </div>
    </AsciiMetricsProvider>
  );
}
