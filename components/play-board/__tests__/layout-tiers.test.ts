import {
  PLAY_LAYOUT,
  buildLayoutCss,
  PLAY_LAYOUT_TIERS,
  MEDIUM_MEDIA,
  buildTieredLayoutCss,
  inheritedFrom,
  layoutForTier,
} from '../layout-css';

describe('layout tiers', () => {
  it('large is the saved base layout', () => {
    expect(layoutForTier('large')).toEqual(PLAY_LAYOUT);
  });

  it('small keeps the base and medium overrides, then its own', () => {
    const { medium, small } = PLAY_LAYOUT_TIERS;
    const saved = { medium: { ...medium }, small: { ...small } };
    // Made-up keys, so baked tier values in the real maps cannot interfere.
    medium.ltestA = '111';
    medium.ltestB = '222';
    small.ltestB = '333';

    expect(layoutForTier('medium').ltestA).toBe('111');
    expect(layoutForTier('small').ltestA).toBe('111');
    expect(layoutForTier('small').ltestB).toBe('333');
    expect(layoutForTier('large').ltestB).toBeUndefined();
    expect(inheritedFrom('small', 'ltestA')).toBe('medium');
    expect(inheritedFrom('small', 'ltestB')).toBe('small');
    expect(inheritedFrom('small', 'ltestC')).toBe('large');

    Object.keys(medium).forEach((key) => delete medium[key]);
    Object.keys(small).forEach((key) => delete small[key]);
    Object.assign(medium, saved.medium);
    Object.assign(small, saved.small);
  });

  it('emits the base and a medium query, plus small only on a phone', () => {
    const resolve = (tier: string) => (tier === 'small' ? { lfz0: '55' } : {});
    const desktop = buildTieredLayoutCss(resolve, false);
    const phone = buildTieredLayoutCss(resolve, true);

    expect(desktop).toContain(`@media ${MEDIUM_MEDIA}`);
    expect(desktop).not.toContain('scale:0.55');
    expect(phone.lastIndexOf('scale:0.55')).toBeGreaterThan(
      phone.indexOf(`@media ${MEDIUM_MEDIA}`),
    );
  });

  it('lfz0 and lfz1 scale each hero toward its anchored corner', () => {
    const css = buildLayoutCss({ lfz0: '70', lfz1: '60' });

    expect(css).toContain('figMe');
    expect(css).toMatch(/scale:0\.7 !important;transform-origin:0 100%/);
    expect(css).toMatch(/scale:0\.6 !important;transform-origin:0 0/);
  });

  it('lfs=right moves the scale origin to the right edge', () => {
    const css = buildLayoutCss({ lfz0: '70', lfs: 'right' });

    expect(css).toContain('transform-origin:100% 100% !important');
  });
});
