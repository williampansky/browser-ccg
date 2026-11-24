import { produce } from 'immer';
import { legalActions } from '../../rules/legal-actions';
import {
  catalog,
  endTurn,
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

describe('PRIME_189', () => {
  it('summons a 2/1 Defias Bandit only with Combo', () => {
    const plain = play(setup('PRIME_189', {})).state;
    const withCombo = play(afterOneCard(setup('PRIME_189', {}))).state;

    expect(stats(plain, '0')).toEqual([[2, 2]]);
    expect(stats(withCombo, '0')).toEqual([
      [2, 2],
      [2, 1],
    ]);
  });
});

describe('PRIME_198', () => {
  it('needs no target without Combo', () => {
    const start = setup('PRIME_198', { theirs: [[1, 3]] });

    expect(playsWithTarget(start)).toBe(false);
    expect(stats(play(start).state, '1')).toHaveLength(1);
  });

  it('returns an enemy minion to its owner hand with Combo', () => {
    const start = afterOneCard(setup('PRIME_198', { theirs: [[1, 3]] }));
    const handBefore = start.players['1'].hand.length;
    const { state } = play(start, mref(start, '1', 0));

    expect(stats(state, '1')).toHaveLength(0);
    expect(state.players['1'].hand).toHaveLength(handBefore + 1);
  });

  it('returns a friendly minion to your own hand with Combo', () => {
    const start = afterOneCard(setup('PRIME_198', { mine: [[1, 3]] }));
    const handBefore = start.players['0'].hand.length;
    const { state } = play(start, mref(start, '0', 0));

    expect(stats(state, '0')).toEqual([[5, 3]]);
    expect(state.players['0'].hand).toHaveLength(handBefore);
  });
});

describe('PRIME_191', () => {
  it('deals 2 damage to the enemy hero and does not come back without Combo', () => {
    const { state } = play(setup('PRIME_191', {}));

    expect(state.players['1'].health).toBe(28);
    expect(state.players['0'].returning).toBeUndefined();
  });

  it('with Combo it returns to your hand at the start of your next turn', () => {
    const { state } = play(afterOneCard(setup('PRIME_191', {})));
    const nextTurn = endTurn(endTurn(state));
    const { hand } = nextTurn.players['0'];

    expect(hand.some((card) => card.cardId === 'PRIME_191')).toBe(true);
    expect(nextTurn.players['0'].returning).toBeUndefined();
  });

  it('is not in your hand on the opponent turn in between', () => {
    const { state } = play(afterOneCard(setup('PRIME_191', {})));
    const midTurn = endTurn(state);

    expect(
      midTurn.players['0'].hand.some((card) => card.cardId === 'PRIME_191'),
    ).toBe(false);
  });
});
