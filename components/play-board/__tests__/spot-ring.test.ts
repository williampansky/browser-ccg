import { ringState } from '../pixi-fx/spot';
import { spotSides } from '../spot-anchor';
import { SPELL_FX_DEFAULTS } from '../spell-fx-tune';
import type { SpellFxTune } from '../spell-fx-tune';

const descending: SpellFxTune = {
  ...SPELL_FX_DEFAULTS,
  spotDescendEnd: 70,
  spotDescendStart: 100,
  spotRadius: 120,
  spotRingsMotion: 'descend',
};

describe('descending spot rings', () => {
  it('start above the spot and end below it', () => {
    expect(ringState(0, descending).offsetY).toBe(-100);
    expect(ringState(1, descending).offsetY).toBe(70);
  });

  it('close as they slide down', () => {
    const early = ringState(0.1, descending).radius;
    const late = ringState(0.9, descending).radius;

    expect(late).toBeLessThan(early);
  });

  it('fade in and out, and are clear at both ends', () => {
    expect(ringState(0, descending).alpha).toBeCloseTo(0);
    expect(ringState(0.5, descending).alpha).toBeCloseTo(1);
    expect(ringState(1, descending).alpha).toBeCloseTo(0);
  });

  it('leave the other motions at the spot height', () => {
    const motions: SpellFxTune['spotRingsMotion'][] = ['out', 'in', 'pulse'];

    motions.forEach((motion) => {
      const tune = { ...descending, spotRingsMotion: motion };

      expect(ringState(0.5, tune).offsetY).toBe(0);
    });
  });
});

describe('spot anchor sides', () => {
  it('has no minion side for the target anchor', () => {
    expect(spotSides('target', '0')).toEqual([]);
  });

  it.each([
    ['my-minions', '0', ['0']],
    ['my-minions', '1', ['1']],
    ['enemy-minions', '0', ['1']],
    ['enemy-minions', '1', ['0']],
    ['all-minions', '0', ['0', '1']],
  ] as const)('%s for player %s covers %j', (anchor, caster, expected) => {
    expect(spotSides(anchor, caster)).toEqual(expected);
  });
});
