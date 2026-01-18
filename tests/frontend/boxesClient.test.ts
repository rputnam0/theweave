import { describe, it, expect, vi, afterEach } from 'vitest';
import { solveBox } from '../../src/components/ui/ascii/boxesClient';

describe('solveBox', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('iterates until measured size matches target', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ boxText: 'first', measured: { cols: 8, rows: 3 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ boxText: 'second', measured: { cols: 10, rows: 4 } }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const response = await solveBox(
      {
        design: 'simple',
        text: 'hello',
        size: { cols: 10, rows: 4 },
        padding: { top: 1, right: 1, bottom: 1, left: 1 },
      },
      'http://example.com'
    );

    expect(response.boxText).toBe('second');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const body1 = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const body2 = JSON.parse(fetchMock.mock.calls[1][1].body as string);

    expect(body1.cols).toBe(10);
    expect(body1.rows).toBe(4);
    expect(body2.cols).toBe(12);
    expect(body2.rows).toBe(5);
  });
});
