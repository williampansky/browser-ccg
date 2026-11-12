import { produce } from 'immer';
import { effectiveCost } from '../../rules/cost';
import { legalActions } from '../../rules/legal-actions';
import { backTo, catalog, endTurn, failCode, hero, hurt, minion, mref, play, realCard, run, setup, stats, withWeapon } from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// Batch F: Poison, untargetable, effects aimed at the opponent, random pools of targets, and assorted fresh cards.

const ids = '223 116 194 071 242 249 245 234 151 014 090 093 215 087 057 221 012 253 254 251 100 096 088 187 190 079 098 037 211 147 219 060 197 229 092'.split(' ');
it.each(ids)('PRIME_%s is defined', (n) => expect(legalActions(setup(`PRIME_${n}`, { mine: [[1, 3]], theirs: [[1, 3]] }), '0', catalog)).toBeDefined());
it('PRIME_092a Sushi is defined too (the token item)', () => expect(realCard('PRIME_092a').type).toBe('item'));

const attack = (s: GameState, attackerIdx: number, target: Parameters<typeof run>[1] extends infer A ? any : never): GameState => {
  const r = run(s, { type: 'Attack', attackerId: s.players[s.activePlayer].board[attackerIdx].instanceId, target } as Action);
  if ('error' in r) throw new Error(r.error);
  return r.state;
};

describe('Poison (Touch of Death)', () => {
  /** The imps are Concealed (untargetable), so the tests reveal them first. */
  const reveal = (s: GameState): GameState => produce(s, (g) => void (g.players['0'].board.forEach((m) => (m.keywords.hidden = false))));
  it('060 / 197 destroy what they damage, even a huge minion', () => {
    for (const id of ['PRIME_060', 'PRIME_197']) {
      // P1 attacks P0's poisoned minion with a big one
      let s = setup('CORE_043', { mine: [[1, 3, id]], theirs: [[2, 50]] });
      s = endTurn(reveal(play(s).state));
      const r = attack(s, 0, mref(s, '0', 0));
      expect(r.players['1'].board).toHaveLength(0);
    }
  });
  it('a Bubble absorbs it (no damage, no poison)', () => {
    let s = setup('CORE_043', { mine: [[1, 3, 'PRIME_060']], theirs: [[2, 50]] });
    s = produce(s, (g) => void (g.players['1'].board[0].keywords.bubble = true));
    s = endTurn(reveal(play(s).state));
    const r = attack(s, 0, mref(s, '0', 0));
    expect(r.players['1'].board).toHaveLength(1);
  });
  it('a 0-Attack victim still dies if the poisoned minion hits it, but a poisoned minion that is not damaged does not kill', () => {
    const s = setup('CORE_043', { mine: [[1, 3, 'PRIME_060']], theirs: [[0, 50]] });
    const r = attack(play(s).state, 0, mref(play(s).state, '1', 0));
    expect(r.players['1'].board).toHaveLength(0);
  });
  it('229 only poisons Creatures', () => {
    const vs = (race: string) => {
      const s = setup('CORE_043', { mine: [[1, 14, 'PRIME_229']], theirs: [[0, 50, race]] });
      return attack(play(s).state, 0, mref(play(s).state, '1', 0)).players['1'].board.length;
    };
    expect(vs('CORE_070a')).toBe(0); // a Creature
    expect(vs('PRIME_061')).toBe(1); // a Location
  });
  it('a Suppressed poisoner loses Touch of Death', () => {
    let s = setup('CORE_043', { mine: [[1, 3, 'PRIME_060']], theirs: [[2, 50]] });
    s = produce(s, (g) => void (g.players['0'].board[0].silenced = true));
    s = endTurn(reveal(play(s).state));
    expect(attack(s, 0, mref(s, '0', 0)).players['1'].board).toHaveLength(1);
  });
  it('060 is Concealed (1/3)', () => {
    const m = minion(play(setup('PRIME_060')).state, '0', 0);
    expect([m.attack, m.health, m.keywords.hidden]).toEqual([1, 3, true]);
  });
});

describe('PRIME_012 Bare Boned (2/3): not targetable by spells or items', () => {
  it('a spell cannot aim at it, but a warcry and an attack can', () => {
    const spell = setup('CORE_093', { theirs: [[1, 5, 'PRIME_012']] });
    expect(failCode(spell, mref(spell, '1', 0))).toBe('ILLEGAL_TARGET');
    const warcry = setup('CORE_036', { theirs: [[1, 5, 'PRIME_012']] });
    expect(failCode(warcry, mref(warcry, '1', 0))).toBeUndefined();
    const item = setup('CORE_046', { mine: [[1, 5, 'PRIME_012']] });
    expect(realCard('CORE_046').type).toBe('item');
    expect(failCode(item, mref(item, '0', 0))).toBe('ILLEGAL_TARGET');
  });
  it('once Suppressed it can be targeted', () => {
    const s = produce(setup('CORE_093', { theirs: [[1, 5, 'PRIME_012']] }), (g) => void (g.players['1'].board[0].silenced = true));
    expect(failCode(s, mref(s, '1', 0))).toBeUndefined();
  });
});

describe('spells and items', () => {
  it('223 destroys a friendly minion and deals its Attack to all enemy minions', () => {
    const s = setup('PRIME_223', { mine: [[4, 2]], theirs: [[1, 9], [1, 3]] });
    const r = play(s, mref(s, '0', 0)).state;
    expect(r.players['0'].board).toHaveLength(0);
    expect(stats(r, '1')).toEqual([[1, 5]]); // the 3-Health one died
  });
  it('116 gives your minions +2/+2 and Guard', () => {
    const r = play(setup('PRIME_116', { mine: [[1, 1], [2, 2]], theirs: [[1, 1]] })).state;
    expect(r.players['0'].board.map((m) => [m.attack, m.health, m.keywords.guard])).toEqual([[3, 3, true], [4, 4, true]]);
    expect(r.players['1'].board[0].keywords.guard).toBe(false);
  });
  it('194 destroys your weapon and deals its Attack to all enemies; nothing without one', () => {
    const s = withWeapon(setup('PRIME_194', { theirs: [[1, 5]] }), '0');
    const r = play(s).state;
    expect([r.players['0'].weapon, stats(r, '1')[0][1], r.players['1'].health]).toEqual([null, 3, 28]);
    expect(play(setup('PRIME_194', { theirs: [[1, 5]] })).state.players['1'].health).toBe(30);
  });
  it('242 Snap destroys a random number of minions', () => {
    const counts = new Set<number>();
    for (let seed = 1; seed < 30; seed++) {
      const s = setup('PRIME_242', { mine: [[1, 1], [1, 1]], theirs: [[1, 1], [1, 1]] });
      const r = run(s, { type: 'PlayCard', handIndex: 0 } as Action, seed);
      if ('error' in r) throw new Error(r.error);
      counts.add(r.state.players['0'].board.length + r.state.players['1'].board.length);
    }
    expect(counts.size).toBeGreaterThan(2); // it really varies
    expect(Math.max(...Array.from(counts))).toBeLessThanOrEqual(4);
  });
  it('234 deals 2 to an enemy minion and draws only if it survives', () => {
    const s = setup('PRIME_234', { theirs: [[1, 5], [1, 2]] });
    expect(play(s, mref(s, '1', 0)).state.players['0'].hand).toHaveLength(1);
    expect(play(s, mref(s, '1', 1)).state.players['0'].hand).toHaveLength(0);
    const mine = setup('PRIME_234', { mine: [[1, 5]] });
    expect(failCode(mine, mref(mine, '0', 0))).toBe('ILLEGAL_TARGET');
  });
  it('151 deals 2 and draws only if the minion was already Disabled', () => {
    let s = setup('PRIME_151', { theirs: [[1, 9]] });
    expect(play(s, mref(s, '1', 0)).state.players['0'].hand).toHaveLength(0);
    s = produce(s, (g) => void (g.players['1'].board[0].disabledOnTurn = g.turn + 1));
    expect(play(s, mref(s, '1', 0)).state.players['0'].hand).toHaveLength(1);
  });
  it('014 Archery Yard spreads 4 single points of damage over random characters', () => {
    const { events } = play(setup('PRIME_014', { mine: [[1, 9]], theirs: [[1, 9]] }));
    expect(events.filter((e) => e.type === 'MinionDamaged' || e.type === 'HeroDamaged')).toHaveLength(4);
  });
  it('187 Showdown makes two random enemy minions hit each other', () => {
    const r = play(setup('PRIME_187', { theirs: [[3, 5], [2, 9]] })).state;
    expect(stats(r, '1')).toEqual([[3, 3], [2, 6]]);
    const one = play(setup('PRIME_187', { theirs: [[3, 5]] })).state;
    expect(stats(one, '1')).toEqual([[3, 5]]);
  });
  it('190 Slash deals 2 to 4 damage to the chosen character', () => {
    const seen = new Set<number>();
    for (let seed = 1; seed < 40; seed++) {
      const s = setup('PRIME_190');
      const r = run(s, { type: 'PlayCard', handIndex: 0, target: hero('1') } as Action, seed);
      if ('error' in r) throw new Error(r.error);
      seen.add(30 - r.state.players['1'].health);
    }
    expect(Array.from(seen).sort()).toEqual([2, 3, 4]);
  });
  it('211 draws a card that costs 3 less; 219 draws two minions from the deck', () => {
    const r = play(setup('PRIME_211')).state;
    expect(r.players['0'].hand[0].costDelta).toBe(-3);
    const s = setup('PRIME_219');
    const t = produce(s, (g) => {
      g.players['0'].deck = [
        { instanceId: 9001, cardId: 'CORE_043' },
        { instanceId: 9002, cardId: 'PRIME_062' },
        { instanceId: 9003, cardId: 'PRIME_074' },
        { instanceId: 9004, cardId: 'PRIME_033' },
      ];
    });
    const d = play(t).state;
    expect(d.players['0'].hand.map((c) => c.cardId)).toEqual(['PRIME_062', 'PRIME_074']);
    expect(d.players['0'].deck.map((c) => c.cardId)).toEqual(['CORE_043', 'PRIME_033']);
  });
  it('092 Predator gives your OPPONENT two Sushi, which buff a friendly minion +1/+1', () => {
    const s = setup('PRIME_092');
    const r = play(s).state;
    expect(r.players['1'].hand.filter((c) => c.cardId === 'PRIME_092a')).toHaveLength(2);
    expect(r.players['0'].hand).toHaveLength(0);
    const t = setup('PRIME_092a', { mine: [[1, 1]] });
    expect(stats(play(t, mref(t, '0', 0)).state, '0')).toEqual([[2, 2]]);
  });
  it('147 Vibrant Mage makes your next Mystery this turn cost 0, once', () => {
    let s = setup('PRIME_147', { hand: ['PRIME_143', 'PRIME_127'] });
    expect(effectiveCost(s, '0', realCard('PRIME_143'), catalog)).toBe(3);
    s = play(s).state;
    expect(effectiveCost(s, '0', realCard('PRIME_143'), catalog)).toBe(0);
    const energy = s.players['0'].energy.current;
    s = play(s).state; // the Mystery
    expect(s.players['0'].energy.current).toBe(energy);
    expect(effectiveCost(s, '0', realCard('PRIME_127'), catalog)).toBe(2); // used up
  });
});

describe('minions on the board', () => {
  it('057 gives the opponent an energy slot; 221 destroys one of yours', () => {
    expect(play(setup('PRIME_057')).state.players['1'].energy.total).toBe(setup('PRIME_057').players['1'].energy.total + 1);
    const r = play(setup('PRIME_221')).state;
    expect(r.players['0'].energy.total).toBe(9);
    expect(r.players['0'].energy.current).toBeLessThanOrEqual(9);
  });
  it('071 destroys a random enemy minion with 2 or less Attack, only', () => {
    const r = play(setup('PRIME_071', { theirs: [[3, 3], [2, 2], [5, 5]] })).state;
    expect(stats(r, '1')).toEqual([[3, 3], [5, 5]]);
    expect(play(setup('PRIME_071', { theirs: [[3, 3]] })).state.players['1'].board).toHaveLength(1);
  });
  it('079 destroys all Bubbles and gains +3/+3 for each', () => {
    let s = setup('PRIME_079', { mine: [[1, 1], [1, 1]], theirs: [[1, 1]] });
    s = produce(s, (g) => {
      g.players['0'].board[0].keywords.bubble = true;
      g.players['1'].board[0].keywords.bubble = true;
    });
    const r = play(s).state;
    const ghost = r.players['0'].board.find((m) => m.cardId === 'PRIME_079')!;
    expect([ghost.attack, ghost.health]).toEqual([9, 9]);
    expect([r.players['0'].board[0].keywords.bubble, r.players['1'].board[0].keywords.bubble]).toEqual([false, false]);
  });
  it('087 has Spell Damage +1 and draws on death', () => {
    const s = setup('CORE_125', { mine: [[1, 1, 'PRIME_087']], theirs: [[1, 9]] });
    expect(stats(play(s).state, '1')[0][1]).toBe(6); // 2 damage + 1
    const died = produce(setup('CORE_043', { mine: [[1, 1, 'PRIME_087']] }), (g) => void (g.players['0'].board[0].health = 0));
    expect(play(died).state.players['0'].hand).toHaveLength(1);
  });
  it('090 Appa sometimes draws an extra card at the start of your turn', () => {
    const hands = new Set<number>();
    for (let seed = 1; seed < 30; seed++) {
      const s = setup('CORE_043', { mine: [[0, 4, 'PRIME_090']] });
      const mid = play(s).state;
      const back = (() => {
        let x = endTurn(mid);
        const r = run(x, { type: 'EndTurn' } as Action, seed);
        return 'error' in r ? x : r.state;
      })();
      hands.add(back.players['0'].hand.length);
    }
    expect(hands.size).toBe(2); // with and without the extra card
  });
  it('093 heals a random friendly minion 2 when you summon another', () => {
    let s = setup('PRIME_005', { mine: [[2, 5, 'PRIME_093']] });
    s = hurt(s, '0', 0, 1);
    const r = play(s).state;
    expect(stats(r, '0')[0][1]).toBe(3);
  });
  it('215 buffs ANOTHER random friendly minion +1 Health at the end of your turn, never itself, and only on your turn', () => {
    const r = endTurn(play(setup('CORE_043', { mine: [[0, 1, 'PRIME_215'], [1, 4]] })).state);
    expect(stats(r, '0')).toEqual([[0, 1], [1, 5]]);
    for (let seed = 1; seed <= 12; seed++) {
      const s = play(setup('CORE_043', { mine: [[0, 1, 'PRIME_215'], [1, 4], [1, 4]] })).state;
      const e = run(s, { type: 'EndTurn' } as Action, seed);
      if ('error' in e) throw new Error(e.error);
      expect(stats(e.state, '0')[0]).toEqual([0, 1]); // the Mushroomer itself never grows
      expect(stats(e.state, '0').filter((x) => x[1] === 5)).toHaveLength(1); // exactly one of the others did
    }
    // alone, it has nobody to buff
    expect(stats(endTurn(play(setup('CORE_043', { mine: [[0, 1, 'PRIME_215']] })).state), '0')[0][1]).toBe(1);
    expect(stats(endTurn(play(setup('CORE_043', { theirs: [[0, 1, 'PRIME_215'], [1, 4]] })).state), '1')[1][1]).toBe(4);
  });
  it('245 hits a random enemy for 8 at the end of your turn', () => {
    const r = endTurn(play(setup('CORE_043', { mine: [[8, 8, 'PRIME_245']], theirs: [[1, 30]] })).state);
    expect(r.players['1'].health + stats(r, '1')[0][1]).toBe(30 + 30 - 8);
  });
  it('249 Hell Executioner kills a random enemy minion for every card you play (not itself)', () => {
    let s = setup('CORE_043', { mine: [[4, 7, 'PRIME_249']], theirs: [[1, 1], [1, 1], [1, 1]] });
    s = play(s).state;
    expect(s.players['1'].board).toHaveLength(2);
    const m = setup('PRIME_005', { mine: [[4, 7, 'PRIME_249']], theirs: [[1, 1], [1, 1]] });
    expect(play(m).state.players['1'].board).toHaveLength(1); // a minion play counts, and 249 itself coming in does not (it was not on the board)
  });
  it('037 Skelly makes your minions cost 3 more while it is on your board', () => {
    const s = setup('CORE_043', { mine: [[7, 6, 'PRIME_037']] });
    expect(effectiveCost(s, '0', realCard('PRIME_034'), catalog)).toBe(8);
    expect(effectiveCost(s, '0', realCard('CORE_043'), catalog)).toBe(realCard('CORE_043').cost);
    const theirs = setup('CORE_043', { theirs: [[7, 6, 'PRIME_037']] });
    expect(effectiveCost(theirs, '0', realCard('PRIME_034'), catalog)).toBe(5);
  });
  it('098 summons a Guard 2/2 at the end of your turn', () => {
    const r = endTurn(play(setup('CORE_043', { mine: [[4, 4, 'PRIME_098']] })).state);
    expect(stats(r, '0')).toEqual([[4, 4], [2, 2]]);
    expect(r.players['0'].board[1].keywords.guard).toBe(true);
  });
  it('088 copies a spell to the OTHER player\'s hand', () => {
    const mine = play(setup('CORE_043', { mine: [[0, 6, 'PRIME_088']] })).state;
    expect(mine.players['1'].hand.map((c) => c.cardId)).toContain('CORE_043');
    expect(mine.players['0'].hand).toHaveLength(0);
    // I cast it while the opponent owns the Traveler: the copy goes to the OTHER hand, which is the owner's (the opponent's)
    const theirs = play(setup('CORE_043', { theirs: [[0, 6, 'PRIME_088']] })).state;
    expect(theirs.players['1'].hand.map((c) => c.cardId)).toContain('CORE_043');
    expect(theirs.players['0'].hand).toHaveLength(0);
  });
});

describe('the big ones', () => {
  it('100 Sellarus and 096 Parker summon for the OPPONENT', () => {
    const died = produce(setup('CORE_043', { mine: [[9, 7, 'PRIME_100']] }), (g) => void (g.players['0'].board[0].health = 0));
    const r = play(died).state;
    expect(stats(r, '1')).toEqual([[3, 3]]);
    const p = play(setup('PRIME_096')).state;
    expect(stats(p, '1')).toEqual([[1, 1], [1, 1]]);
    expect(stats(p, '0')).toEqual([[6, 2]]);
  });
  it('251 steals 2 random minions and summons Glory on death', () => {
    const r = play(setup('PRIME_251', { theirs: [[1, 1], [2, 2], [3, 3]] })).state;
    expect(r.players['0'].board).toHaveLength(3);
    expect(r.players['1'].board).toHaveLength(1);
    const died = produce(setup('CORE_043', { mine: [[10, 10, 'PRIME_251']] }), (g) => void (g.players['0'].board[0].health = 0));
    expect(stats(play(died).state, '0')).toEqual([[4, 5]]); // Glory (4/5)
  });
  it('253 sets every OTHER minion to 1 Health; 254 destroys every other minion; both leave a token on death', () => {
    const a = play(setup('PRIME_253', { mine: [[1, 5]], theirs: [[1, 9]] })).state;
    expect([stats(a, '0')[0][1], stats(a, '1')[0][1], stats(a, '0')[1]]).toEqual([1, 1, [10, 10]]);
    const b = play(setup('PRIME_254', { mine: [[1, 5]], theirs: [[1, 9]] })).state;
    expect(b.players['0'].board.map((m) => m.cardId)).toEqual(['PRIME_254']);
    expect(b.players['1'].board).toHaveLength(0);
    const died = produce(setup('CORE_043', { mine: [[10, 10, 'PRIME_254']] }), (g) => void (g.players['0'].board[0].health = 0));
    expect(play(died).state.players['0'].board.map((m) => m.cardId)).toEqual(['PRIME_254a']);
  });
});
