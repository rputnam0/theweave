import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AsciiBox } from '../../src/components/AsciiBox';
import { AsciiMetricsContext } from '../../src/components/ui/ascii/metricsContext';

const metrics = { charWidthPx: 10, lineHeightPx: 20 };

const withMetrics = (ui: JSX.Element) => (
  <AsciiMetricsContext.Provider value={metrics}>
    {ui}
  </AsciiMetricsContext.Provider>
);

describe('AsciiBox', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders API ASCII and sizes to measured dimensions', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ boxText: '++\n++', measured: { cols: 2, rows: 2 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const element = (
      <AsciiBox
        design="simple"
        width="20ch"
        height="6lh"
        padding="1ch"
        content="Hello"
        apiBaseUrl="http://example.com"
        debounceMs={0}
      />
    );
    const { container, rerender } = render(withMetrics(element));
    rerender(withMetrics(element));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const pre = container.querySelector('pre');
    expect(pre?.textContent).toBe('++\n++');

    const root = container.querySelector('.ascii-root') as HTMLDivElement;
    expect(root.style.width).toBe('20px');
    expect(root.style.height).toBe('40px');
    warnSpy.mockRestore();
  });

  it('sends snapped size, padding, and normalized text', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ boxText: '', measured: { cols: 20, rows: 6 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const element = (
      <AsciiBox
        design="simple"
        width="20ch"
        height="6lh"
        padding="1ch"
        content={'Hi\tThere'}
        tabs={2}
        apiBaseUrl="http://example.com"
        debounceMs={0}
      />
    );
    const { rerender } = render(withMetrics(element));
    rerender(withMetrics(element));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.cols).toBe(20);
    expect(body.rows).toBe(6);
    expect(body.padding).toEqual({ top: 1, right: 1, bottom: 1, left: 1 });
    expect(body.text).toBe('Hi  There');
    expect(body.eol).toBe('LF');
    warnSpy.mockRestore();
  });

  it('truncates overflow by display width for unicode glyphs', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ boxText: '', measured: { cols: 2, rows: 2 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const element = (
      <AsciiBox
        design="simple"
        width="2ch"
        height="2lh"
        padding={0}
        wrap="off"
        overflow="clip"
        content="A🙂B"
        apiBaseUrl="http://example.com"
        debounceMs={0}
      />
    );
    const { rerender } = render(withMetrics(element));
    rerender(withMetrics(element));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.text).toBe('A');
    warnSpy.mockRestore();
  });

  it('preserves leading indentation when wrapping words', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ boxText: '', measured: { cols: 12, rows: 3 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const element = (
      <AsciiBox
        design="simple"
        width="12ch"
        height="3lh"
        padding={0}
        wrap="word"
        content="  two words"
        apiBaseUrl="http://example.com"
        debounceMs={0}
      />
    );
    const { rerender } = render(withMetrics(element));
    rerender(withMetrics(element));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.text).toBe('  two\n  words');
    warnSpy.mockRestore();
  });
});
