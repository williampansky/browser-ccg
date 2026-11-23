import { produce } from 'immer';
import { legalActions } from '../../rules/legal-actions';
import {
  catalog,
  hero,
  mref,
  play,
  setup,
  stats,
} from '../../testing/real-cards';
import type { GameState } from '../../state/types';

// Combo: the card's extra applies when a card was already played this turn.

const afterOneCard = (state: GameState): GameState =>
  produce(state, (g) => {
    g.players['0'].plays = { now: 1, prev: 0 };
  });

const playsWithTarget = (state: GameState): boolean =>
  legalActions(state, '0', catalog).some(
    (a) => a.type === 'PlayCard' && a.handIndex === 0 && !!a.target,
  );

describe('PRIME_188', () => {
  const build = (combo: boolean) => {
    const start = setup('PRIME_188', { theirs: [[1, 9]] });
    return combo ? afterOneCard(start) : start;
  };

  it('gives +2 Attack, or +4 instead with Combo', () => {
    const plain = build(false);
    const withCombo = build(true);

    expect(stats(play(plain, mref(plain, '1', 0)).state, '1')[0][0]).toBe(3);
    expect(
      stats(play(withCombo, mref(withCombo, '1', 0)).state, '1')[0][0],
    ).toBe(5);
  });
});

describe('PRIME_193', () => {
  it('needs no target and does nothing without Combo', () => {
    const start = setup('PRIME_193', { theirs: [[1, 9]] });

    expect(playsWithTarget(start)).toBe(false);
    expect(stats(play(start).state, '1')[0][1]).toBe(9);
  });

  it('asks for a target and deals 2 damage with Combo', () => {
    const start = afterOneCard(setup('PRIME_193', { theirs: [[1, 9]] }));

    expect(playsWithTarget(start)).toBe(true);
    expect(stats(play(start, mref(start, '1', 0)).state, '1')[0][1]).toBe(7);
  });

  it('can aim at the enemy hero with Combo', () => {
    const start = afterOneCard(setup('PRIME_193', {}));
    const { state } = play(start, hero('1'));

    expect(state.players['1'].health).toBe(28);
  });
});

describe('PRIME_192', () => {
  it('deals 1 damage, or 2 instead with Combo', () => {
    const plain = setup('PRIME_192', { theirs: [[1, 9]] });
    const withCombo = afterOneCard(plain);

    expect(stats(play(plain, mref(plain, '1', 0)).state, '1')[0][1]).toBe(8);
    expect(
      stats(play(withCombo, mref(withCombo, '1', 0)).state, '1')[0][1],
    ).toBe(7);
  });

  it('equips the weapon', () => {
    const start = setup('PRIME_192', { theirs: [[1, 9]] });
    const { state } = play(start, mref(start, '1', 0));

    expect(state.players['0'].weapon?.attack).toBe(2);
  });
});

describe('PRIME_199', () => {
  it('gains +2/+2 for each other card played this turn', () => {
    const start = produce(setup('PRIME_199', {}), (g) => {
      g.players['0'].plays = { now: 2, prev: 0 };
    });

    expect(stats(play(start).state, '0')[0]).toEqual([6, 6]);
  });

  it('stays 2/2 when it is the first card', () => {
    expect(stats(play(setup('PRIME_199', {})).state, '0')[0]).toEqual([2, 2]);
  });
});
