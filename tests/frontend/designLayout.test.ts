import { describe, expect, it } from 'vitest';
import designLayout from '../../src/components/ui/ascii/designLayout.json';

describe('designLayout', () => {
  it('captures border thickness and padding for scroll-akn', () => {
    const scroll = (designLayout as Record<string, any>)['scroll-akn'];
    expect(scroll).toBeTruthy();
    expect(scroll.border).toEqual({ top: 1, right: 9, bottom: 3, left: 9 });
    expect(scroll.padding).toEqual({ top: 0, right: 1, bottom: 0, left: 1 });
    expect(scroll.contentInset).toEqual({ top: 1, right: 10, bottom: 3, left: 10 });
  });

  it('captures border thickness and padding for parchment', () => {
    const parchment = (designLayout as Record<string, any>).parchment;
    expect(parchment).toBeTruthy();
    expect(parchment.border).toEqual({ top: 1, right: 3, bottom: 2, left: 3 });
    expect(parchment.padding).toEqual({ top: 1, right: 1, bottom: 0, left: 1 });
    expect(parchment.contentInset).toEqual({ top: 2, right: 4, bottom: 2, left: 4 });
  });
});
