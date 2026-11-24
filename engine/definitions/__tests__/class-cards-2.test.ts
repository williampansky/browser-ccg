import { produce } from 'immer';
import { legalActions } from '../../rules/legal-actions';
import {
  catalog,
  endTurn,
  failCode,
  hero,
  minion,
  mref,
  play,
  run,
  setup,
  stats,
} from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// Class cards that were active but had no definition (PRIME_130, 131, 134,
// 135, 145, 153, 168, 182 and 240).

const withHealth = (state: GameState, health: number): GameState =>
  produce(state, (g) => {
    g.players['0'].health = health;
  });

describe('PRIME_130', () => {
  it('cannot be played with fewer than 2 minions on your side', () => {
    const start = setup('PRIME_130', { mine: [[1, 1]], theirs: [[2, 2]] });
    const offered = legalActions(start, '0', catalog).some(
      (a) => a.type === 'PlayCard' && a.handIndex === 0,
    );

    expect(failCode(start)).toBe('CANT_PLAY');
    expect(offered).toBe(false);
  });

  it('destroys a random enemy minion with 2 or more on your side', () => {
    const start = setup('PRIME_130', {
      mine: [
        [1, 1],
        [1, 1],
      ],
      theirs: [
        [2, 2],
        [3, 3],
      ],
    });

    expect(play(start).state.players['1'].board).toHaveLength(1);
  });
});

describe('PRIME_131', () => {
  it('summons one 1/1 Rush Hound for each enemy minion', () => {
    const start = setup('PRIME_131', {
      theirs: [
        [2, 2],
        [3, 3],
        [4, 4],
      ],
    });
    const result = play(start).state;

    expect(stats(result, '0')).toEqual([
      [1, 1],
      [1, 1],
      [1, 1],
    ]);
    expect(minion(result, '0', 0).keywords.rush).toBe(true);
  });

  it('summons nothing against an empty enemy board', () => {
    expect(play(setup('PRIME_131')).state.players['0'].board).toHaveLength(0);
  });
});

describe('PRIME_134', () => {
  it('gains 1 Durability when a friendly Mystery is revealed', () => {
    const start = setup('PRIME_157', {
      hand: ['PRIME_134'],
      theirs: [[3, 5]],
    });
    const mystery = play(start).state;
    const armed = endTurn(play(mystery).state);
    const weapon = armed.players['0'].weapon;
    const result = run(armed, {
      type: 'Attack',
      attackerId: armed.players['1'].board[0].instanceId,
      target: hero('0'),
    });

    if ('error' in result) throw new Error(result.error);
    expect(result.state.players['0'].weapon?.durability).toBe(
      (weapon?.durability ?? 0) + 1,
    );
  });

  it('ignores an enemy Mystery being revealed', () => {
    const start = setup('PRIME_134', { theirs: [[1, 1]] });
    const equipped = play(start).state;

    expect(equipped.players['0'].weapon?.durability).toBe(2);
  });
});

describe('PRIME_135', () => {
  it('deals 5 to a minion and 2 to the minions next to it', () => {
    const start = setup('PRIME_135', {
      theirs: [
        [1, 9],
        [1, 9],
        [1, 9],
      ],
    });
    const result = play(start, mref(start, '1', 1)).state;

    expect(stats(result, '1')).toEqual([
      [1, 7],
      [1, 4],
      [1, 7],
    ]);
  });
});

describe('PRIME_145', () => {
  it('disables a minion and its neighbours and deals 1 damage to each', () => {
    const start = setup('PRIME_145', {
      theirs: [
        [1, 5],
        [1, 5],
        [1, 5],
      ],
    });
    const result = play(start, mref(start, '1', 0)).state;

    expect(stats(result, '1')).toEqual([
      [1, 4],
      [1, 4],
      [1, 5],
    ]);
    expect(minion(result, '1', 0).disabledOnTurn).toBeDefined();
    expect(minion(result, '1', 1).disabledOnTurn).toBeDefined();
    expect(minion(result, '1', 2).disabledOnTurn).toBeUndefined();
  });
});

describe('PRIME_153', () => {
  it('deals 10 damage to a character', () => {
    const start = setup('PRIME_153');

    expect(play(start, hero('1')).state.players['1'].health).toBe(20);
  });
});

describe('PRIME_168', () => {
  it('heals 8 and draws 3 cards', () => {
    const start = withHealth(setup('PRIME_168'), 10);
    const handBefore = start.players['0'].hand.length;
    const result = play(start, hero('0')).state;

    expect(result.players['0'].health).toBe(18);
    expect(result.players['0'].hand).toHaveLength(handBefore - 1 + 3);
  });
});

describe('PRIME_182', () => {
  it('summons a copy of a minion from the opponent deck, leaving the deck', () => {
    const start = setup('PRIME_182');
    const result = play(start).state;

    expect(result.players['0'].board).toHaveLength(1);
    expect(result.players['1'].deck).toHaveLength(start.players['1'].deck.length);
  });

  it('does nothing when the opponent deck has no minion', () => {
    const start = produce(setup('PRIME_182'), (g) => {
      g.players['1'].deck = [];
    });

    expect(play(start).state.players['0'].board).toHaveLength(0);
  });
});

describe('PRIME_240', () => {
  it('deals 4 damage, or 6 with 12 or less Health', () => {
    const healthy = setup('PRIME_240', { theirs: [[1, 9]] });
    const low = withHealth(setup('PRIME_240', { theirs: [[1, 9]] }), 12);

    expect(stats(play(healthy, mref(healthy, '1', 0)).state, '1')[0][1]).toBe(5);
    expect(stats(play(low, mref(low, '1', 0)).state, '1')[0][1]).toBe(3);
  });
});

// The eight class cards that were switched on in Airtable on 2026-11-23.

const act = (state: GameState, action: Action): GameState => {
  const result = run(state, action);

  if ('error' in result) throw new Error(result.error);

  return result.state;
};

describe('PRIME_133', () => {
  it('sends an attack on your hero to another character', () => {
    const start = setup('PRIME_133', {
      mine: [[1, 9]],
      theirs: [[3, 5]],
    });
    const armed = endTurn(play(start).state);
    const result = act(armed, {
      type: 'Attack',
      attackerId: armed.players['1'].board[0].instanceId,
      target: hero('0'),
    });

    expect(result.players['0'].health).toBe(30);
    expect(result.players['0'].mystery).toBeNull();
  });

  it('does nothing when the attack was not aimed at your hero', () => {
    const start = setup('PRIME_133', {
      mine: [[1, 9]],
      theirs: [[3, 5]],
    });
    const armed = endTurn(play(start).state);
    const result = act(armed, {
      type: 'Attack',
      attackerId: armed.players['1'].board[0].instanceId,
      target: mref(armed, '0', 0),
    });

    expect(result.players['0'].mystery?.cardId).toBe('PRIME_133');
  });
});

describe('PRIME_138', () => {
  const equipped = (): GameState =>
    play(setup('PRIME_138', { theirs: [[4, 9]] })).state;

  it('takes no counter-damage when the hero attacks a minion', () => {
    const state = equipped();
    const result = act(state, {
      type: 'WeaponAttack',
      target: mref(state, '1', 0),
    });

    expect(result.players['0'].health).toBe(30);
    expect(stats(result, '1')[0][1]).toBe(4);
  });
});

describe('PRIME_144', () => {
  it('summons a copy of a minion the opponent plays', () => {
    const start = setup('PRIME_144');
    const armed = endTurn(play(start).state);
    const result = act(armed, { type: 'PlayCard', handIndex: 0, boardIndex: 0 });

    expect(result.players['1'].board).toHaveLength(1);
    expect(result.players['0'].board).toHaveLength(1);
    expect(result.players['0'].mystery).toBeNull();
  });
});

describe('PRIME_164', () => {
  it('deals damage equal to the cost of the card it draws', () => {
    const start = produce(setup('PRIME_164', { theirs: [[1, 20]] }), (g) => {
      g.players['0'].deck[0].cardId = 'PRIME_153';
    });
    const result = play(start, mref(start, '1', 0)).state;

    expect(stats(result, '1')[0][1]).toBe(10);
    expect(result.players['0'].hand.at(-1)?.cardId).toBe('PRIME_153');
  });
});

describe('PRIME_173', () => {
  it('puts copies of 2 cards from their deck into your hand', () => {
    const start = setup('PRIME_173');
    const handBefore = start.players['0'].hand.length;
    const result = play(start).state;

    expect(result.players['0'].hand).toHaveLength(handBefore - 1 + 2);
    expect(result.players['1'].deck).toHaveLength(start.players['1'].deck.length);
  });
});

describe('PRIME_230', () => {
  it('deals 1 damage to a minion and gives it +2 Attack', () => {
    const start = setup('PRIME_230', { theirs: [[1, 5]] });

    expect(stats(play(start, mref(start, '1', 0)).state, '1')[0]).toEqual([
      3, 4,
    ]);
  });
});
