import { flashState, hasFinisher, ringState } from '../pixi-fx/finisher';
import { SPELL_FX_DEFAULTS } from '../spell-fx-tune';
import type { SpellFxTune } from '../spell-fx-tune';

const tune: SpellFxTune = {
  ...SPELL_FX_DEFAULTS,
  finishFlash: 4,
  finishRing: 100,
  finishRingWidth: 6,
};

describe('finishers', () => {
  it('are off by default, so every old look plays as before', () => {
    expect(hasFinisher(SPELL_FX_DEFAULTS)).toBe(false);
    expect(SPELL_FX_DEFAULTS.burstSpeed).toBe(1);
  });

  it.each([
    ['a bloom', { finishFlash: 2 }],
    ['a ring', { finishRing: 50 }],
    ['lingering sparkles', { finishLinger: 12 }],
  ])('turn on with %s', (_name, change) => {
    expect(hasFinisher({ ...SPELL_FX_DEFAULTS, ...change })).toBe(true);
  });

  it('grow a bloom to full size while it fades out', () => {
    const start = flashState(0, tune);
    const end = flashState(1, tune);

    expect(start.scale).toBeLessThan(end.scale);
    expect(end.scale).toBeCloseTo(tune.finishFlash);
    expect(start.alpha).toBe(1);
    expect(end.alpha).toBe(0);
  });

  it('open a ring to its reach, thinning and fading as it goes', () => {
    const start = ringState(0, tune);
    const end = ringState(1, tune);

    expect(start.radius).toBe(0);
    expect(end.radius).toBeCloseTo(tune.finishRing);
    expect(end.alpha).toBe(0);
    expect(end.width).toBeLessThan(start.width);
    expect(end.width).toBeGreaterThan(0);
  });
});
