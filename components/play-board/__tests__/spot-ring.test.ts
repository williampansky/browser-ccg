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

describe('descending ring end point and shape', () => {
  const toHealth: SpellFxTune = {
    ...descending,
    spotDescendEnd: 38,
    spotDescendEndRadius: 22,
    spotDescendEndX: 42,
    spotDescendRound: 1,
    spotDescendStart: 90,
    spotDescendStartX: -5,
    spotRadius: 90,
    spotRingSquash: 0.35,
  };

  it('moves from the start point to the end point in X and Y', () => {
    const start = ringState(0, toHealth);
    const end = ringState(1, toHealth);

    expect([start.offsetX, start.offsetY]).toEqual([-5, -90]);
    expect([end.offsetX, end.offsetY]).toEqual([42, 38]);
  });

  it('closes to the end radius', () => {
    expect(ringState(0, toHealth).radius).toBe(90);
    expect(ringState(1, toHealth).radius).toBeCloseTo(22);
  });

  it('goes from flat to round when asked, and keeps its height when not', () => {
    expect(ringState(0, toHealth).squash).toBeCloseTo(0.35);
    expect(ringState(1, toHealth).squash).toBeCloseTo(1);
    expect(ringState(1, { ...toHealth, spotDescendRound: 0 }).squash).toBe(
      0.35,
    );
  });

  it('plays exactly as before while the new settings are at their defaults', () => {
    const state = ringState(0.5, descending);

    expect(state.offsetX).toBe(0);
    expect(state.squash).toBe(descending.spotRingSquash);
    expect(state.radius).toBeGreaterThan(descending.spotDescendEndRadius);
  });
});

describe('descending ring arrival', () => {
  const holding: SpellFxTune = {
    ...descending,
    spotDescendArrive: 0.6,
    spotDescendEndX: 40,
    spotDescendRound: 1,
  };

  it('reaches the end point early and then holds there', () => {
    const arrived = ringState(0.6, holding);
    const later = ringState(0.9, holding);

    expect(arrived.offsetX).toBe(40);
    expect(later.offsetX).toBe(40);
    expect(later.offsetY).toBe(arrived.offsetY);
    expect(later.radius).toBe(arrived.radius);
  });

  it('still fades out while it holds', () => {
    expect(ringState(0.9, holding).alpha).toBeLessThan(
      ringState(0.6, holding).alpha,
    );
  });

  it('is not changed by a default arrival of 1', () => {
    const slow = ringState(0.5, descending);
    const sameButExplicit = ringState(0.5, {
      ...descending,
      spotDescendArrive: 1,
    });

    expect(sameButExplicit).toEqual(slow);
  });
});
