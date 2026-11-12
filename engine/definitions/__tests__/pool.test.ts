import { produce } from 'immer';
import { isPlayable } from '../../decks';
import { cardPool } from '../../rules/card-pool';
import { catalog, mref, play, run, setup, stats } from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// "Add / summon a random card": the pool is every playable CORE or PRIME card, narrowed by the card's own condition.

const withSeed = (s: GameState, seed: number) => {
  const r = run(s, { type: 'PlayCard', handIndex: 0 } as Action, seed);
  if ('error' in r) throw new Error(r.error);
  return r.state;
};
const handCards = (s: GameState) => s.players['0'].hand.map((c) => catalog.get(c.cardId)!);

describe('the pool', () => {
  it('holds only real, playable, non-token cards, in a stable order', () => {
    const pool = cardPool(catalog);
    expect(pool.length).toBeGreaterThan(250);
    expect(pool.every((c) => !c.isToken && !!c.name && isPlayable(c) && (c.source === 'core' || c.source === 'prime'))).toBe(true);
    expect(pool.map((c) => c.id)).toEqual(pool.map((c) => c.id).sort());
  });
});

describe('add a random card', () => {
  it('140 Tome of Spells adds a spell costing 3 or less (varying with the seed)', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 25; seed++) {
      const added = handCards(withSeed(setup('PRIME_140'), seed));
      expect(added).toHaveLength(1);
      expect([added[0].type, added[0].cost <= 3]).toEqual(['spell', true]);
      seen.add(added[0].id);
    }
    expect(seen.size).toBeGreaterThan(5);
  });
  it('186 Gift Box adds 2 cards, 216 a Demonic minion, 091 a Mythic minion', () => {
    expect(handCards(withSeed(setup('PRIME_186'), 3))).toHaveLength(2);
    for (let seed = 1; seed <= 10; seed++) {
      const ritual = handCards(withSeed(setup('PRIME_216'), seed))[0];
      expect([ritual.type, ritual.race]).toEqual(['minion', 'DEMONIC']);
      const harry = handCards(play(setup('PRIME_091')).state)[0];
      expect([harry.type, harry.rarity]).toEqual(['minion', 'MYTHIC']);
    }
  });
  it('a full hand burns the card', () => {
    const s = produce(setup('PRIME_186'), (g) => void (g.players['0'].hand.push(...Array.from({ length: 9 }, (_, i) => ({ instanceId: 8000 + i, cardId: 'CORE_043' })))));
    const r = withSeed(s, 1);
    expect(r.players['0'].hand.length).toBe(10);
  });
  it('154 Amaad gives a card that costs 4 less whenever you play a card, but not for itself', () => {
    const s = setup('CORE_043', { mine: [[5, 7, 'PRIME_154']] });
    const r = play(s).state;
    expect(r.players['0'].hand).toHaveLength(1);
    expect(r.players['0'].hand[0].costDelta).toBe(-4);
    const m = play(setup('PRIME_005', { mine: [[5, 7, 'PRIME_154']] })).state; // a minion played counts
    expect(m.players['0'].hand).toHaveLength(1);
    const own = play(setup('PRIME_154')).state; // Amaad entering play does not trigger itself
    expect(own.players['0'].hand).toHaveLength(0);
  });
});

describe('summon a random card', () => {
  it('084 Serene Valley leaves a Creature when it dies', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const died = produce(setup('CORE_043', { mine: [[2, 5, 'PRIME_084']] }), (g) => void (g.players['0'].board[0].health = 0));
      const r = withSeed(died, seed);
      // (the Creature that arrives may react to the spell that was cast just before: Spider King summons a Spider)
      expect(r.players['0'].board.length).toBeGreaterThanOrEqual(1);
      expect(catalog.get(r.players['0'].board[0].cardId)!.race).toBe('CREATURE');
    }
  });
  it('227 Zap deals 2 and summons a 4-6 cost Undead only if the minion dies', () => {
    const kill = setup('PRIME_227', { theirs: [[1, 2]] });
    const r = play(kill, mref(kill, '1', 0)).state;
    expect(r.players['0'].board).toHaveLength(1);
    const c = catalog.get(r.players['0'].board[0].cardId)!;
    expect([c.race, c.cost >= 4 && c.cost <= 6]).toEqual(['DEMONIC', true]);
    const survive = setup('PRIME_227', { theirs: [[1, 9]] });
    const t = play(survive, mref(survive, '1', 0)).state;
    expect([t.players['0'].board.length, stats(t, '1')[0][1]]).toEqual([0, 7]);
  });
});
