import { produce } from 'immer';
import {
  catalog,
  endTurn,
  hero,
  hurt,
  minion,
  mref,
  play,
  run,
  setup,
  stats,
} from '../../testing/real-cards';
import { putInHand } from '../../testing/builders';
import type { GameState } from '../../state/types';

// The twelve cards added for the launch-pool gap list (PRIME_261 to 272).

const afterOneCard = (state: GameState): GameState =>
  produce(state, (g) => {
    g.players['0'].plays = { now: 1, prev: 0 };
  });

describe('PRIME_261', () => {
  it('gains 1 Armor whenever a friendly minion takes damage', () => {
    const start = setup('PRIME_261', {
      hand: ['PRIME_265'],
      mine: [[2, 5]],
    });
    const played = play(start).state;
    const hit = play(played, mref(played, '0', 0)).state;

    expect(hit.players['0'].armor).toBe(1);
  });

  it('ignores damage to enemy minions', () => {
    const start = setup('PRIME_261', {
      hand: ['PRIME_265'],
      theirs: [[2, 5]],
    });
    const played = play(start).state;
    const hit = play(played, mref(played, '1', 0)).state;

    expect(hit.players['0'].armor).toBe(0);
  });
});

describe('PRIME_262', () => {
  const build = () => setup('PRIME_262', { theirs: [[4, 4]] });

  it('takes 2 Attack from an enemy minion', () => {
    const start = build();

    expect(stats(play(start, mref(start, '1', 0)).state, '1')[0][0]).toBe(2);
  });

  it('gives the Attack back when the caster next turn starts', () => {
    const start = build();
    const hit = play(start, mref(start, '1', 0)).state;
    const theirTurn = endTurn(hit);
    const myTurn = endTurn(theirTurn);

    expect(stats(theirTurn, '1')[0][0]).toBe(2);
    expect(stats(myTurn, '1')[0][0]).toBe(4);
  });

  it('never takes an enemy minion below 0 Attack', () => {
    const start = setup('PRIME_262', { theirs: [[1, 4]] });

    expect(stats(play(start, mref(start, '1', 0)).state, '1')[0][0]).toBe(0);
  });
});

describe('PRIME_263', () => {
  it('destroys a minion and heals the hero for its Health', () => {
    const start = produce(setup('PRIME_263', { theirs: [[1, 6]] }), (g) => {
      g.players['0'].health = 10;
    });
    const result = play(start, mref(start, '1', 0)).state;

    expect(result.players['1'].board).toHaveLength(0);
    expect(result.players['0'].health).toBe(16);
  });

  it('heals only for the Health the minion has left', () => {
    const start = produce(
      hurt(setup('PRIME_263', { theirs: [[1, 6]] }), '1', 0, 2),
      (g) => {
        g.players['0'].health = 10;
      },
    );

    expect(play(start, mref(start, '1', 0)).state.players['0'].health).toBe(12);
  });
});

describe('PRIME_264', () => {
  const fill = (mine: number, theirs: number): GameState => {
    let state = setup('PRIME_264');
    state = produce(state, (g) => {
      g.players['1'].hand = [];
    });
    for (let i = 0; i < mine; i++) state = putInHand(state, '0', 'GRUNT');
    for (let i = 0; i < theirs; i++) state = putInHand(state, '1', 'GRUNT');
    return state;
  };

  it('draws until the hands are the same size', () => {
    const state = fill(1, 4);

    expect(play(state).state.players['0'].hand).toHaveLength(4);
  });

  it('stops at 5 cards', () => {
    const state = fill(0, 9);

    expect(play(state).state.players['0'].hand).toHaveLength(5);
  });

  it('draws nothing when you already have as many', () => {
    const state = fill(3, 2);

    expect(play(state).state.players['0'].hand).toHaveLength(3);
  });
});

describe('PRIME_265', () => {
  it('deals 2 damage, or 4 instead with Combo', () => {
    const plain = setup('PRIME_265', { theirs: [[1, 9]] });
    const combo = afterOneCard(plain);

    expect(stats(play(plain, mref(plain, '1', 0)).state, '1')[0][1]).toBe(7);
    expect(stats(play(combo, mref(combo, '1', 0)).state, '1')[0][1]).toBe(5);
  });

  it('can hit a hero', () => {
    const start = setup('PRIME_265');

    expect(play(start, hero('1')).state.players['1'].health).toBe(28);
  });
});

describe('PRIME_266', () => {
  it('returns an enemy minion to its owner, costing 1 more', () => {
    const start = setup('PRIME_266', { theirs: [[2, 2]] });
    const result = play(start, mref(start, '1', 0)).state;
    const returned = result.players['1'].hand.at(-1);

    expect(result.players['1'].board).toHaveLength(0);
    expect(returned?.costDelta).toBe(1);
  });

  it('cannot aim at your own minion', () => {
    const start = setup('PRIME_266', { mine: [[2, 2]] });
    const result = run(start, {
      type: 'PlayCard',
      handIndex: 0,
      target: mref(start, '0', 0),
    });

    expect('error' in result).toBe(true);
  });
});

describe('PRIME_267', () => {
  it('gives +2 Attack and Poison, so it destroys what it damages', () => {
    const start = setup('PRIME_267', {
      mine: [[1, 5]],
      theirs: [[1, 20]],
    });
    const buffed = play(start, mref(start, '0', 0)).state;

    expect(stats(buffed, '0')[0]).toEqual([3, 5]);
    expect(minion(buffed, '0', 0).poisonous).toBe(true);

    const ready = produce(buffed, (g) => {
      g.players['0'].board[0].playedOnTurn = -5;
    });
    const attacked = run(ready, {
      type: 'Attack',
      attackerId: minion(ready, '0', 0).instanceId,
      target: mref(ready, '1', 0),
    });

    if ('error' in attacked) throw new Error(attacked.error);
    expect(attacked.state.players['1'].board).toHaveLength(0);
  });
});

describe('PRIME_268', () => {
  it('returns every minion on both boards to its owner', () => {
    const start = setup('PRIME_268', {
      mine: [[2, 2]],
      theirs: [
        [3, 3],
        [4, 4],
      ],
    });
    const result = play(start).state;

    expect(result.players['0'].board).toHaveLength(0);
    expect(result.players['1'].board).toHaveLength(0);
    expect(result.players['1'].hand.length).toBe(
      start.players['1'].hand.length + 2,
    );
  });
});

describe('PRIME_269', () => {
  it('deals 2 damage to a minion that is not Demonic', () => {
    const start = setup('PRIME_269', { theirs: [[2, 5]] });

    expect(stats(play(start, mref(start, '1', 0)).state, '1')[0]).toEqual([
      2, 3,
    ]);
  });

  it('gives a Demonic minion +2/+2 instead', () => {
    const start = setup('PRIME_269', { mine: [[2, 5, 'PRIME_270']] });

    expect(stats(play(start, mref(start, '0', 0)).state, '0')[0]).toEqual([
      4, 7,
    ]);
  });
});

describe('PRIME_270', () => {
  it('discards 2 random cards from your hand', () => {
    const start = setup('PRIME_270', { hand: ['GRUNT', 'GRUNT', 'GRUNT'] });
    const result = play(start).state;

    expect(result.players['0'].hand).toHaveLength(1);
  });

  it('can attack the turn it is played (Rush)', () => {
    const start = setup('PRIME_270');

    expect(minion(play(start).state, '0', 0).keywords.rush).toBe(true);
  });
});

describe('PRIME_271', () => {
  it('sets your Health to 15 and summons a 6/6 token', () => {
    const start = setup('PRIME_271');
    const result = play(start).state;

    expect(result.players['0'].health).toBe(15);
    expect(stats(result, '0')).toEqual([
      [3, 15],
      [6, 6],
    ]);
  });

  it('raises Health too: it sets, it does not only lower', () => {
    const start = produce(setup('PRIME_271'), (g) => {
      g.players['0'].health = 4;
    });

    expect(play(start).state.players['0'].health).toBe(15);
  });
});

describe('PRIME_272', () => {
  it('destroys a minion and its owner draws 2 cards', () => {
    const start = setup('PRIME_272', { theirs: [[3, 3]] });
    const result = play(start, mref(start, '1', 0)).state;

    expect(result.players['1'].board).toHaveLength(0);
    expect(result.players['1'].hand.length).toBe(
      start.players['1'].hand.length + 2,
    );
  });

  it('gives you the cards when it destroys your own minion', () => {
    const start = setup('PRIME_272', { mine: [[3, 3]] });
    const result = play(start, mref(start, '0', 0)).state;

    expect(result.players['0'].hand.length).toBe(
      start.players['0'].hand.length - 1 + 2,
    );
  });
});

it('every PRIME_261 to 272 card is in the catalog', () => {
  for (let id = 261; id <= 272; id++)
    expect(catalog.get(`PRIME_${id}`)).toBeDefined();
  expect(catalog.get('PRIME_271a')?.attack).toBe(6);
});
