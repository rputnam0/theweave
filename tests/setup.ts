import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class MockResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    const rect = target.getBoundingClientRect();
    const width = rect.width || 320;
    const height = rect.height || 200;
    this.callback(
      [{ target, contentRect: { ...rect, width, height } } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }

  unobserve() {}

  disconnect() {}
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(0), 0)
);

vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));

HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  return {
    font: '',
    measureText: (text: string) => ({ width: text.length * 8 }),
  } as unknown as CanvasRenderingContext2D;
});
