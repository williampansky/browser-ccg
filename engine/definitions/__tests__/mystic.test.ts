import { produce } from 'immer';
import { getCardDef } from '..';
import { isPlayable } from '../../decks';
import { legalActions } from '../../rules/legal-actions';
import {
  backTo,
  catalog,
  endTurn,
  failCode,
  hero,
  mref,
  play,
  realCard,
  run,
  setup,
} from '../../testing/real-cards';
import type { GameState } from '../../state/types';

// The three Mystic cards that had no behaviour yet: PRIME_206, PRIME_207 and
// PRIME_212 (the other twelve cards of PRIME 200-214 were already defined).

const kill = (s: GameState, index: number): GameState =>
  produce(s, (g) => void (g.players['0'].board[index].health = 0));
const boardIds = (s: GameState): string[] =>
  s.players['0'].board.map((m) => m.cardId);

it.each(['206', '207', '212'])('PRIME_%s is defined and playable', (n) => {
  expect(getCardDef(realCard(`PRIME_${n}`))).toBeDefined();
  expect(isPlayable(realCard(`PRIME_${n}`))).toBe(true);
});

describe('PRIME_206: give a minion "On Death: Resurrect"', () => {
  const grant = () => {
    const s = setup('PRIME_206', {
      mine: [[2, 3]],
      theirs: [[1, 1]],
      hand: ['CORE_043'],
    });

    return play(s, mref(s, '0', 0)).state;
  };

  it('can only be aimed at a minion you control', () => {
    const s = setup('PRIME_206', { mine: [[2, 3]], theirs: [[1, 1]] });
    const targets = legalActions(s, '0', catalog)
      .filter((a) => a.type === 'PlayCard' && a.handIndex === 0)
      .map((a) => (a.type === 'PlayCard' ? a.target : undefined));

    expect(targets).toEqual([mref(s, '0', 0)]);
    expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET');
  });
  it('marks the minion, and its death brings it back as a fresh copy', () => {
    const granted = grant();

    expect(granted.players['0'].board[0].resurrects).toBe(true);

    const back = play(kill(granted, 0)).state.players['0'];

    expect(back.board).toHaveLength(1);
    expect(back.board[0].cardId).toBe('GRUNT');
    expect(back.board[0].resurrects).toBeUndefined();
    expect(back.board[0].instanceId).not.toBe(
      granted.players['0'].board[0].instanceId,
    );
  });
  it('returns the printed card, not the stats it had when it died', () => {
    const s = setup('PRIME_206', { mine: [[7, 9]], hand: ['CORE_043'] });
    const granted = play(s, mref(s, '0', 0)).state;
    const back = play(kill(granted, 0)).state.players['0'].board[0];

    expect([back.attack, back.health]).toEqual([2, 3]);
  });
  it('only works once: the copy that comes back stays dead', () => {
    const granted = grant();
    const back = play(kill(granted, 0)).state;
    const second = run(kill(back, 0), { type: 'EndTurn' });

    if ('error' in second) throw new Error(second.error);

    expect(second.state.players['0'].board).toHaveLength(0);
  });
  it('still comes back from a full board, since its own slot is free', () => {
    const s = setup('PRIME_206', {
      mine: [
        [2, 3],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      hand: ['CORE_043'],
    });
    const granted = play(s, mref(s, '0', 0)).state;
    const after = play(kill(granted, 0)).state;

    expect(after.players['0'].board).toHaveLength(7);
    expect(after.players['0'].board[6].cardId).toBe('GRUNT');
  });
  it('is removed by Silence', () => {
    const s = setup('PRIME_206', {
      mine: [[2, 3]],
      hand: ['PRIME_171', 'CORE_043'],
    });
    const granted = play(s, mref(s, '0', 0)).state;
    const silenced = play(granted, mref(granted, '0', 0)).state;

    expect(silenced.players['0'].board[0].resurrects).toBeUndefined();
    expect(play(kill(silenced, 0)).state.players['0'].board).toHaveLength(0);
  });
});

describe('PRIME_207: summon two 2/3 Guard minions, Overload (2)', () => {
  const after = (s: GameState) => play(s).state.players['0'];

  it('names PRIME_207a as its entourage card, a real 2/3 in the data', () => {
    const token = realCard('PRIME_207a');

    expect(realCard('PRIME_207').entourage).toEqual(['PRIME_207a']);
    expect([token.attack, token.health]).toEqual([2, 3]);
  });
  it('summons that card twice, each a 2/3 with Guard', () => {
    const me = after(setup('PRIME_207'));

    expect(me.board.map((m) => m.cardId)).toEqual(['PRIME_207a', 'PRIME_207a']);
    expect(me.board.map((m) => [m.attack, m.health])).toEqual([
      [2, 3],
      [2, 3],
    ]);
    expect(me.board.every((m) => m.keywords.guard)).toBe(true);
  });
  it('costs 3 and locks 2 energy next turn', () => {
    const me = after(setup('PRIME_207'));

    expect(me.energy.current).toBe(7);
    expect(me.overcharge).toBe(2);
  });
  it('summons only one when there is room for one', () => {
    const full = setup('PRIME_207', {
      mine: [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
    });

    expect(after(full).board).toHaveLength(7);
  });
});

describe('PRIME_212: 2/8 weapon with Onslaught, Overload (2)', () => {
  const equipped = () => play(setup('PRIME_212')).state;
  const swing = (s: GameState) => {
    const r = run(s, { type: 'WeaponAttack', target: hero('1') });

    return 'error' in r ? r.error : r.state;
  };
  const swings = (s: GameState) =>
    legalActions(s, '0', catalog).filter((a) => a.type === 'WeaponAttack')
      .length;

  it('equips a 2/8 weapon, costs 5 and locks 2 energy next turn', () => {
    const me = equipped().players['0'];

    expect(me.weapon).toMatchObject({
      cardId: 'PRIME_212',
      attack: 2,
      durability: 8,
    });
    expect(me.energy.current).toBe(5);
    expect(me.overcharge).toBe(2);
  });
  it('can swing twice in a turn, one durability each, and no more', () => {
    const first = swing(equipped());

    if (typeof first === 'string') throw new Error(first);
    expect(swings(first)).toBeGreaterThan(0);

    const second = swing(first);

    if (typeof second === 'string') throw new Error(second);
    expect(second.players['1'].health).toBe(26);
    expect(second.players['0'].weapon?.durability).toBe(6);
    expect(swings(second)).toBe(0);
    expect(swing(second)).toBe('HERO_CANT_ATTACK');
  });
  it('gets its two swings back on the next turn', () => {
    const first = swing(equipped());
    const second = typeof first === 'string' ? first : swing(first);

    if (typeof second === 'string') throw new Error(second);

    const next = backTo(endTurn(second), '0');

    expect(swings(next)).toBeGreaterThan(0);
  });
  it('leaves every other weapon at one swing a turn (PRIME_204)', () => {
    const sword = play(setup('PRIME_204')).state;
    const first = swing(sword);

    if (typeof first === 'string') throw new Error(first);

    expect(swings(first)).toBe(0);
  });
});
