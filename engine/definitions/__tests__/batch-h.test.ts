import { produce } from 'immer';
import { effectiveCost } from '../../rules/cost';
import { legalActions } from '../../rules/legal-actions';
import { backTo, catalog, endTurn, failCode, hero, hurt, minion, mref, play, realCard, run, setup, stats, withWeapon } from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// Batch H: the Sprite tribe, temporary control, copies, and cards that give a minion or a player a lasting flag.

const ids = '080 044 077 058 064 169 051 051a 137 238 089 196 056 155 184 063 179 183 083 252 114'.split(' ');
it.each(ids)('PRIME_%s is defined', (n) => expect(legalActions(setup(`PRIME_${n}`, { mine: [[1, 3]], theirs: [[1, 3]] }), '0', catalog)).toBeDefined());

const SPRITE = 'CORE_012'; // a 2/1 Sprite
const give = (s: GameState, player: '0' | '1', cardId: string, energy = 10): GameState =>
  produce(s, (g) => {
    g.players[player].hand = [{ instanceId: 7000 + g.nextInstanceId++, cardId }];
    g.players[player].energy = { current: energy, total: energy };
  });
const act = (s: GameState, a: Action) => {
  const r = run(s, a);
  if ('error' in r) throw new Error(r.error);
  return r.state;
};

describe('Sprite tribe', () => {
  it('080 gives a Sprite you summon +2 Attack this turn and Rush, nobody else', () => {
    const s = play(setup(SPRITE, { mine: [[3, 3, 'PRIME_080']] })).state;
    const sprite = s.players['0'].board.find((m) => m.cardId === SPRITE)!;
    expect([sprite.attack, sprite.keywords.rush]).toEqual([4, true]);
    expect(stats(endTurn(s), '0').find((x) => x[1] === 1)![0]).toBe(2); // gone at end of turn
    const plain = play(setup('PRIME_005', { mine: [[3, 3, 'PRIME_080']] })).state;
    expect(plain.players['0'].board.find((m) => m.cardId === 'PRIME_005')!.keywords.rush).toBe(false);
    const theirs = play(setup(SPRITE, { theirs: [[3, 3, 'PRIME_080']] })).state;
    expect(theirs.players['0'].board[0].keywords.rush).toBe(false);
  });
  it('044 grows +1/+1 when any Sprite dies, not other minions', () => {
    const dies = (id: string) => produce(setup('CORE_043', { mine: [[1, 2, 'PRIME_044'], [1, 1, id]] }), (g) => void (g.players['0'].board[1].health = 0));
    expect(stats(play(dies(SPRITE)).state, '0')[0]).toEqual([2, 3]);
    expect(stats(play(dies('PRIME_005')).state, '0')[0]).toEqual([1, 2]);
  });
  it('077 destroys a friendly Sprite and gains its stats', () => {
    const s = setup('PRIME_077', { mine: [[3, 4, SPRITE], [2, 2]], theirs: [[1, 1, SPRITE]] });
    const r = play(s, mref(s, '0', 0)).state;
    expect(stats(r, '0')).toEqual([[2, 2], [4, 6]]); // the Spider (1/2) + 3/4
    expect(failCode(s, mref(s, '0', 1))).toBe('ILLEGAL_TARGET'); // not a Sprite
    expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET'); // not friendly
  });
  it('058 gives your OTHER Sprites +1/+1 and Bubble', () => {
    const r = play(setup('PRIME_058', { mine: [[2, 2, SPRITE], [2, 2]], theirs: [[2, 2, SPRITE]] })).state;
    expect(r.players['0'].board.map((m) => [m.attack, m.health, m.keywords.bubble])).toEqual([[3, 3, true], [2, 2, false], [2, 3, false]]);
    expect(r.players['1'].board[0].keywords.bubble).toBe(false);
  });
});

describe('064 Cultist Acolyte grows for every card the OPPONENT plays', () => {
  it('a spell, a minion and a weapon the opponent plays each count; yours do not', () => {
    const base = endTurn(play(setup('CORE_043', { mine: [[2, 2, 'PRIME_064']] })).state);
    expect(stats(base, '0')[0]).toEqual([2, 2]);
    const spell = act(give(base, '1', 'CORE_043'), { type: 'PlayCard', handIndex: 0 });
    expect(stats(spell, '0')[0]).toEqual([3, 3]);
    const minionPlay = act(give(base, '1', 'PRIME_005'), { type: 'PlayCard', handIndex: 0 });
    expect(stats(minionPlay, '0')[0]).toEqual([3, 3]);
    const weapon = act(give(base, '1', 'CORE_076'), { type: 'PlayCard', handIndex: 0 });
    expect(stats(weapon, '0')[0]).toEqual([3, 3]);
  });
});

describe('169 and 051: demise with a token', () => {
  it('169 gives 5 Armor and a 3/2 Mace when it dies', () => {
    const s = produce(setup('CORE_043', { mine: [[6, 6, 'PRIME_169']] }), (g) => void (g.players['0'].board[0].health = 0));
    const r = play(s).state;
    expect(r.players['0'].armor).toBe(5);
    expect([r.players['0'].weapon?.cardId, r.players['0'].weapon?.attack, r.players['0'].weapon?.durability]).toEqual(['PRIME_169a', 3, 2]);
  });
  it('051 leaves a Chopped Desert Lizard whose +1/+1 lasts one turn only', () => {
    const s = produce(setup('CORE_043', { mine: [[2, 2, 'PRIME_051'], [1, 3]] }), (g) => void (g.players['0'].board[0].health = 0));
    const r = play(s).state;
    expect(r.players['0'].hand.map((c) => c.cardId)).toEqual(['PRIME_051a']);
    const used = act(give(r, '0', 'PRIME_051a'), { type: 'PlayCard', handIndex: 0, target: mref(r, '0', 0) });
    expect(stats(used, '0')[0]).toEqual([2, 4]);
    expect(stats(endTurn(used), '0')[0]).toEqual([1, 3]);
  });
  it('the temporary Health never leaves a minion below 1', () => {
    let s = setup('PRIME_051a', { mine: [[1, 3]] });
    s = play(s, mref(s, '0', 0)).state;
    s = hurt(s, '0', 0, 1); // took 3 damage of the 4
    expect(stats(endTurn(s), '0')[0][1]).toBe(1);
  });
});

describe('flags on minions and players', () => {
  it('137 gives +2 Attack and Immune until the end of the turn', () => {
    const s = setup('PRIME_137', { mine: [[1, 3]] });
    const buffed = play(s, mref(s, '0', 0)).state;
    expect([buffed.players['0'].board[0].attack, buffed.players['0'].board[0].immune]).toEqual([3, true]);
    const shot = act(give(buffed, '0', 'PRIME_062'), { type: 'PlayCard', handIndex: 0 }); // a 5/8 warcry-damages itself, not it
    expect(stats(shot, '0')[0][1]).toBe(3);
    const wiped = endTurn(buffed);
    expect(wiped.players['0'].board[0].immune).toBeUndefined();
  });
  it('an Immune minion takes no damage in combat either', () => {
    let s = setup('PRIME_137', { mine: [[1, 3]], theirs: [[5, 5]] });
    s = play(s, mref(s, '0', 0)).state;
    const r = act(s, { type: 'Attack', attackerId: s.players['0'].board[0].instanceId, target: mref(s, '1', 0) });
    expect(stats(r, '0')[0][1]).toBe(3); // took nothing from the 5-Attack counter
    expect(stats(r, '1')[0][1]).toBe(2);
  });
  it('238 keeps your minions at 1 Health this turn, and draws', () => {
    const s = setup('PRIME_238', { mine: [[1, 2]], theirs: [[1, 1]] });
    const guarded = play(s).state;
    expect(guarded.players['0'].hand).toHaveLength(1);
    const hit = act(give(guarded, '0', 'CORE_093'), { type: 'PlayCard', handIndex: 0, target: mref(guarded, '0', 0) }); // 3 damage to my own 2-Health minion
    expect(stats(hit, '0')[0][1]).toBe(1);
    const bare = give(setup('CORE_043', { mine: [[1, 2]] }), '0', 'CORE_093');
    const unguarded = act(bare, { type: 'PlayCard', handIndex: 0, target: mref(bare, '0', 0) });
    expect(unguarded.players['0'].board).toHaveLength(0); // without the Ring it dies
    const wore = endTurn(endTurn(guarded)); // the next turn the protection is over
    expect(wore.players['0'].healthFloorOnTurn).not.toBe(wore.turn);
  });
  it('089 makes the opponent\'s spells cost 0 on their next turn only', () => {
    const s = play(setup('PRIME_089')).state;
    expect(effectiveCost(s, '1', realCard('CORE_125'), catalog)).toBe(realCard('CORE_125').cost); // not yet their turn
    const theirTurn = endTurn(s);
    expect(effectiveCost(theirTurn, '1', realCard('CORE_125'), catalog)).toBe(0);
    expect(effectiveCost(theirTurn, '1', realCard('PRIME_034'), catalog)).toBe(5); // minions still cost
    const after = backTo(endTurn(theirTurn), '1');
    expect(effectiveCost(after, '1', realCard('CORE_125'), catalog)).toBe(realCard('CORE_125').cost);
  });
  it('196 makes your next spell this turn cost 2 less and draws a card; it is used up', () => {
    let s = play(setup('PRIME_196', { hand: ['CORE_125', 'CORE_125'] })).state;
    expect(s.players['0'].hand.length).toBe(3); // 2 + the drawn card
    const cost = () => effectiveCost(s, '0', realCard('CORE_125'), catalog);
    const base = realCard('CORE_125').cost;
    expect(cost()).toBe(Math.max(0, base - 2));
    s = act(s, { type: 'PlayCard', handIndex: 0 });
    expect(cost()).toBe(base);
  });
  it('155 makes you draw whenever that minion attacks', () => {
    let s = setup('PRIME_155', { mine: [[1, 3]], theirs: [[1, 9]] });
    s = play(s, mref(s, '0', 0)).state;
    const before = s.players['0'].hand.length;
    const r = act(s, { type: 'Attack', attackerId: s.players['0'].board[0].instanceId, target: hero('1') });
    expect(r.players['0'].hand.length).toBe(before + 1);
  });
  it('184 raises your spells\' damage AND healing by 1', () => {
    const dmg = play(setup('CORE_125', { mine: [[5, 7, 'PRIME_184']], theirs: [[1, 9]] })).state;
    expect(stats(dmg, '1')[0][1]).toBe(6); // 2 + 1
    const healed = (withSorceress: boolean) =>
      stats(play(hurt(setup('PRIME_170', { mine: withSorceress ? [[5, 7, 'PRIME_184'], [1, 20]] : [[1, 20]] }), '0', withSorceress ? 1 : 0, 1)).state, '0');
    expect(healed(false)[0][1]).toBe(1 + 4); // Holy Light heals 4... of a minion hurt down to 1: capped by its 20 maximum
    expect(healed(true)[1][1]).toBe(1 + 4 + 1);
  });
  it('056 Portal swaps itself with a random minion card in your hand at the start of your turn', () => {
    const spells = Array.from({ length: 6 }, (_, i) => ({ instanceId: 9500 + i, cardId: 'CORE_043' }));
    const s = produce(play(setup('CORE_043', { mine: [[0, 3, 'PRIME_056']] })).state, (g) => void (g.players['0'].deck = spells));
    const back = backTo(endTurn(give(s, '0', 'PRIME_005', 5)), '0');
    expect(back.players['0'].board.map((m) => m.cardId)).toEqual(['PRIME_005']);
    expect(back.players['0'].hand.some((c) => c.cardId === 'PRIME_056')).toBe(true);
    const nothing = backTo(endTurn(s), '0'); // only spells in hand: it stays
    expect(nothing.players['0'].board.map((m) => m.cardId)).toEqual(['PRIME_056']);
  });
});

describe('temporary control', () => {
  it('063 Seadog Captain borrows an enemy minion with 2 or less Attack until the end of the turn, and it can attack', () => {
    const s = setup('PRIME_063', { theirs: [[2, 3], [5, 5]] });
    expect(failCode(s, mref(s, '1', 1))).toBe('ILLEGAL_TARGET');
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '1')).toEqual([[5, 5]]);
    const borrowed = r.players['0'].board.find((m) => m.loan)!;
    expect(borrowed.loan?.from).toBe('1');
    const hit = act(r, { type: 'Attack', attackerId: borrowed.instanceId, target: hero('1') });
    expect(hit.players['1'].health).toBe(28);
    const home = endTurn(hit);
    expect(home.players['1'].board).toHaveLength(2);
    expect(home.players['0'].board.every((m) => !m.loan)).toBe(true);
  });
  it('179 takes a minion with 3 or less Attack for a turn', () => {
    const s = setup('PRIME_179', { theirs: [[3, 3], [4, 4]] });
    expect(failCode(s, mref(s, '1', 1))).toBe('ILLEGAL_TARGET');
    const r = play(s, mref(s, '1', 0)).state;
    expect(r.players['0'].board).toHaveLength(1);
    expect(endTurn(r).players['1'].board).toHaveLength(2);
  });
  it('183 Data-Mage keeps it for 2 turns (to the end of YOUR next turn); it cannot attack this turn', () => {
    const s = setup('PRIME_183', { theirs: [[2, 3]] });
    const r = play(s, mref(s, '1', 0)).state;
    const stolen = r.players['0'].board.find((m) => m.loan)!;
    expect(legalActions(r, '0', catalog).some((a) => a.type === 'Attack' && a.attackerId === stolen.instanceId)).toBe(false);
    const theirTurn = endTurn(r);
    expect(theirTurn.players['0'].board.some((m) => m.loan)).toBe(true); // still mine through their turn
    const mine = endTurn(theirTurn);
    expect(legalActions(mine, '0', catalog).some((a) => a.type === 'Attack' && a.attackerId === stolen.instanceId)).toBe(true);
    const gone = endTurn(mine);
    expect(gone.players['1'].board).toHaveLength(1);
    expect(gone.players['0'].board.every((m) => !m.loan)).toBe(true);
  });
  it('a borrowed minion that dies stays dead; a full home board loses it', () => {
    const r = play(setup('PRIME_179', { theirs: [[1, 1]] }), { kind: 'minion', instanceId: setup('PRIME_179', { theirs: [[1, 1]] }).players['1'].board[0].instanceId }).state;
    const full = produce(r, (g) => void (g.players['1'].board = Array.from({ length: 7 }, (_, i) => ({ ...g.players['0'].board[0], instanceId: 9100 + i, loan: undefined }))));
    const ended = endTurn(full);
    expect(ended.players['1'].board).toHaveLength(7);
    expect(ended.players['0'].board).toHaveLength(0); // it had nowhere to go
  });
});

describe('083 Void Egg', () => {
  it('becomes a copy of the chosen minion: its card, stats, keywords and effects', () => {
    const s = setup('PRIME_083', { theirs: [[4, 6, 'PRIME_013']] });
    const r = play(s, mref(s, '1', 0)).state;
    const egg = r.players['0'].board[0];
    expect([egg.cardId, egg.attack, egg.health]).toEqual(['PRIME_013', 4, 6]);
    const died = produce(r, (g) => void (g.players['0'].board[0].health = 0));
    expect(play(give(died, '0', 'CORE_043')).state.players['0'].hand.length).toBe(1); // Ploofer's demise drew a card
  });
  it('copies Guard and damage too', () => {
    let s = setup('PRIME_083', { theirs: [[2, 5]] });
    s = produce(s, (g) => void ((g.players['1'].board[0].keywords.guard = true), (g.players['1'].board[0].health = 3)));
    const egg = play(s, mref(s, '1', 0)).state.players['0'].board[0];
    expect([egg.keywords.guard, egg.health, egg.maxHealth]).toEqual([true, 3, 5]);
  });
});

describe('252 War and Ruin', () => {
  it('forces every other minion to attack a random character on the other side, then leaves Ruin', () => {
    const r = play(setup('PRIME_252', { mine: [[2, 9], [2, 9]], theirs: [[1, 50], [1, 50]] })).state;
    const hurtCount = r.players['1'].board.filter((m) => m.health < 50).length + (r.players['1'].health < 30 ? 1 : 0);
    expect(hurtCount).toBeGreaterThan(0);
    expect(r.players['0'].board.find((m) => m.cardId === 'PRIME_252')).toBeDefined();
    const died = produce(setup('CORE_043', { mine: [[10, 10, 'PRIME_252']] }), (g) => void (g.players['0'].board[0].health = 0));
    expect(stats(play(died).state, '0')).toEqual([[4, 5]]);
  });
});

describe('114 Haranna\'s Curse', () => {
  it('gives your minions a demise that summons a random 2-cost Creature', () => {
    const cursed = play(setup('PRIME_114', { mine: [[1, 1], [1, 1]], theirs: [[1, 1]] })).state;
    expect(cursed.players['0'].board.every((m) => m.deathSummons?.length === 1)).toBe(true);
    expect(cursed.players['1'].board[0].deathSummons).toBeUndefined();
    for (let seed = 1; seed <= 6; seed++) {
      const died = produce(cursed, (g) => void (g.players['0'].board[0].health = 0));
      const r = run(give(died, '0', 'CORE_043'), { type: 'PlayCard', handIndex: 0 } as Action, seed);
      if ('error' in r) throw new Error(r.error);
      const summoned = r.state.players['0'].board.filter((m) => !m.deathSummons);
      expect(summoned).toHaveLength(1);
      const c = catalog.get(summoned[0].cardId)!;
      expect([c.race, c.cost]).toEqual(['CREATURE', 2]);
    }
  });
});
