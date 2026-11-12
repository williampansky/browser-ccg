import { produce } from 'immer';
import { isPlayable } from '../../decks';
import { getCardDef } from '..';
import { legalActions } from '../../rules/legal-actions';
import { backTo, catalog, endTurn, failCode, hero, hurt, mref, play, realCard, run, setup, stats, withWeapon } from '../../testing/real-cards';
import type { GameState, PlayerId } from '../../state/types';

// Batch C: spell damage, auras, this-turn boosts, a pre-attack hook, and the played-cards history.

const ids = [
  ...['011', '015', '028', '037', '003', '062', '108', '130', '048', '106', '111', '127', '081', '084', '050', '091'],
].map((n) => `CORE_${n}`);

describe('Batch C cards are all defined and playable', () => {
  it.each(ids)('%s', (id) => {
    expect(getCardDef(realCard(id))).toBeDefined();
    expect(isPlayable(realCard(id))).toBe(true);
  });
});

/** Gives P0 a Destroy spell (CORE_101) and plays it on one of their own minions. */
const destroyOwn = (s: GameState, boardIndex: number): GameState => {
  const withSpell = produce(s, (g) => {
    g.players['0'].hand.push({ instanceId: 9001, cardId: 'CORE_101' });
    g.players['0'].energy.current = 10;
  });
  const r = run(withSpell, { type: 'PlayCard', handIndex: withSpell.players['0'].hand.length - 1, target: mref(withSpell, '0', boardIndex) });
  if ('error' in r) throw new Error(r.error);
  return r.state;
};

describe('spell damage (RULES Q16: raises damage dealt by your spells, nothing else)', () => {
  it('+1 raises a damage spell by 1, and stacks', () => {
    const one = setup('CORE_053', { mine: [[2, 2, 'CORE_011']], theirs: [[1, 9]] });
    expect(stats(play(one, mref(one, '1', 0)).state, '1')[0][1]).toBe(9 - 3);
    const two = setup('CORE_053', { mine: [[2, 2, 'CORE_011'], [1, 4, 'CORE_015']], theirs: [[1, 9]] });
    expect(stats(play(two, mref(two, '1', 0)).state, '1')[0][1]).toBe(9 - 4);
    expect(play(two, hero('1')).state.players['1'].health).toBe(30 - 4);
  });
  it.each(['CORE_011', 'CORE_015', 'CORE_028', 'CORE_037'])('%s is +1 spell damage', (id) => {
    const s = setup('CORE_053', { mine: [[1, 5, id]], theirs: [[1, 9]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')[0][1]).toBe(6);
  });
  it('the enemy\'s spell damage does nothing for you, and yours is gone once the minion dies', () => {
    const s = setup('CORE_053', { theirs: [[2, 2, 'CORE_011'], [1, 9]] });
    expect(stats(play(s, mref(s, '1', 1)).state, '1')[1][1]).toBe(7);
    const mine = destroyOwn(setup('CORE_053', { mine: [[2, 1, 'CORE_011']], theirs: [[1, 9]], hand: [] }), 0);
    expect(mine.players['0'].board).toHaveLength(0);
    const cast = produce(mine, (g) => {
      g.players['0'].hand = [{ instanceId: 9002, cardId: 'CORE_053' }];
      g.players['0'].energy.current = 10;
    });
    expect(stats(play(cast, mref(cast, '1', 0)).state, '1')[0][1]).toBe(7);
  });
  it('applies to area and random damage, once per hit', () => {
    const s = setup('CORE_072', { mine: [[1, 5, 'CORE_011']], theirs: [[1, 9], [1, 9]] });
    expect(stats(play(s).state, '1').map((x) => x[1])).toEqual([9 - 4, 9 - 4]); // 3 + 1 each
    const r = setup('CORE_060', { mine: [[1, 5, 'CORE_011']], theirs: [[1, 9], [1, 9]] });
    const out = play(r).state;
    expect(30 - out.players['1'].health + (18 - out.players['1'].board.reduce((a, m) => a + m.health, 0))).toBe(8); // two hits of 4 (3 + 1)
  });
  it('does NOT raise warcry damage, heals, or draws', () => {
    const w = setup('CORE_016', { mine: [[1, 5, 'CORE_011']], theirs: [[1, 9]] });
    expect(stats(play(w, mref(w, '1', 0)).state, '1')[0][1]).toBe(8); // warcry: still 1
    const h = setup('CORE_047', { mine: [[1, 5, 'CORE_011']], heroHp: { '1': 5 } });
    expect(play(h, hero('1')).state.players['1'].health).toBe(15); // 5 + 10, not 11 (no spell damage bonus on heals)
    const d = setup('CORE_067', { mine: [[1, 5, 'CORE_011']] });
    expect(play(d).state.players['0'].hand).toHaveLength(2);
  });
  it('raises each damage part of a spell, including lifesteal', () => {
    const s = setup('CORE_119', { mine: [[1, 5, 'CORE_011']], theirs: [[1, 9]], heroHp: { '0': 10 } });
    const r = play(s, mref(s, '1', 0)).state;
    expect([r.players['1'].board[0].health, r.players['0'].health]).toEqual([5, 14]);
  });
});

describe('auras', () => {
  const attacks = (s: GameState, p: PlayerId) => s.players[p].board.map((m) => m.attack);
  it('003 gives your OTHER Sprites +1 Attack; not itself, non-Sprites or enemy Sprites', () => {
    const r = play(setup('CORE_003', { mine: [[2, 2, 'CORE_012'], [2, 2]], theirs: [[2, 2, 'CORE_012']] })).state;
    expect(attacks(r, '0')).toEqual([3, 2, 1]); // Sprite buffed, grunt not, 003 itself not
    expect(attacks(r, '1')).toEqual([2]);
  });
  it('the bonus goes away when the aura minion dies', () => {
    const s = play(setup('CORE_003', { mine: [[2, 2, 'CORE_012']] })).state;
    expect(attacks(s, '0')).toEqual([3, 1]);
    expect(attacks(destroyOwn(s, 1), '0')).toEqual([2]);
  });
  it('a Sprite played later gets the bonus too', () => {
    // CORE_012 is a Sprite whose warcry summons a 1/1 Sprite token
    const r = play(setup('CORE_012', { mine: [[1, 1, 'CORE_003']] })).state;
    expect(attacks(r, '0')).toEqual([1, (realCard('CORE_012').attack ?? 0) + 1, 1 + 1]);
  });
  it('130 gives your other minions +1 Attack, and can\'t attack itself', () => {
    const r = play(setup('CORE_130', { mine: [[2, 2]], theirs: [[2, 2]] })).state;
    expect(attacks(r, '0')).toEqual([3, 1]);
    expect(attacks(r, '1')).toEqual([2]);
    expect(r.players['0'].board[1].keywords.noAttack).toBe(true);
  });
  it('108 gives ADJACENT minions +2 Attack and re-evaluates as the board changes', () => {
    const base = setup('CORE_108', { mine: [[1, 1], [1, 1]] });
    // played at the far right: only the minion beside it is adjacent
    const r = play(base).state;
    expect(attacks(r, '0')).toEqual([1, 3, 0]);
    // played at the far left
    const left = run(base, { type: 'PlayCard', handIndex: 0, boardIndex: 0 });
    if ('error' in left) throw new Error(left.error);
    expect(attacks(left.state, '0')).toEqual([0, 3, 1]);
    // when the neighbour dies, the next one becomes adjacent
    const three = play(setup('CORE_108', { mine: [[1, 1], [1, 1], [1, 5]] })).state; // [a, b, c, 108]
    expect(attacks(three, '0')).toEqual([1, 1, 3, 0]);
  });
  it('062 gives your Creatures Rush while it is on the board', () => {
    const s = setup('CORE_062', { mine: [[3, 2, 'CORE_061']], theirs: [[3, 2, 'CORE_061']] });
    const r = play(s).state;
    const rush = r.players['0'].board.map((m) => m.keywords.rush);
    expect(rush).toEqual([true, true]); // the Creature, and 062 itself (a Creature with Rush)
    expect(r.players['1'].board[0].keywords.rush).toBe(false);
    expect(legalActions(r, '0', catalog).some((a) => a.type === 'Attack' && a.attackerId === r.players['0'].board[0].instanceId)).toBe(true);
  });
  it('062\'s Rush is removed again when it leaves the board', () => {
    const s = play(setup('CORE_062', { mine: [[3, 2, 'CORE_061']] })).state;
    expect(s.players['0'].board[0].keywords.rush).toBe(true);
    const r = destroyOwn(s, 1); // the 062 minion
    expect(r.players['0'].board.map((m) => m.keywords.rush)).toEqual([false]);
  });
});

describe('this-turn boosts', () => {
  it('048 gives all your minions +2 Attack this turn only', () => {
    const s = setup('CORE_048', { mine: [[2, 2], [1, 1]], theirs: [[2, 2]] });
    const r = play(s).state;
    expect(stats(r, '0')).toEqual([[4, 2], [3, 1]]);
    expect(stats(r, '1')).toEqual([[2, 2]]);
    expect(stats(backTo(endTurn(r), '0'), '0')).toEqual([[2, 2], [1, 1]]); // gone after the turn
    expect(stats(endTurn(r), '0')).toEqual([[2, 2], [1, 1]]);
  });
  it('106 gives a friendly minion +3 Attack for one turn', () => {
    const s = setup('CORE_106', { mine: [[2, 2]], theirs: [[2, 2]] });
    const r = play(s, mref(s, '0', 0)).state;
    expect(stats(r, '0')).toEqual([[5, 2]]);
    expect(stats(endTurn(r), '0')).toEqual([[2, 2]]);
    expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET');
  });
  it('111 gives all your minions +3 Attack for one turn', () => {
    const r = play(setup('CORE_111', { mine: [[2, 2], [1, 1]] })).state;
    expect(stats(r, '0')).toEqual([[5, 2], [4, 1]]);
    expect(stats(endTurn(r), '0')).toEqual([[2, 2], [1, 1]]);
  });
  it('only the boost is taken back at end of turn, not other buffs', () => {
    const base = setup('CORE_106', { mine: [[2, 2]] });
    let s = play(base, mref(base, '0', 0)).state; // +3 this turn: 5
    s = produce(s, (g) => {
      g.players['0'].board[0].attack += 1; // a permanent buff on top: 6
    });
    expect(stats(endTurn(s), '0')).toEqual([[3, 2]]);
  });
  it('127 with no weapon equips a 4/1 weapon for this turn only', () => {
    const r = play(setup('CORE_127')).state;
    expect(r.players['0'].weapon).toMatchObject({ attack: 4, durability: 1, temporary: true });
    expect(endTurn(r).players['0'].weapon).toBeNull();
    // used on the turn it is played: hits for 4 and is spent
    const hit = run(r, { type: 'WeaponAttack', target: hero('1') });
    if ('error' in hit) throw new Error(hit.error);
    expect(hit.state.players['1'].health).toBe(26);
    expect(hit.state.players['0'].weapon).toBeNull();
  });
  it('127 with a weapon already equipped adds +4 Attack to it this turn, keeping the weapon and its durability', () => {
    const base = withWeapon(setup('CORE_127'), '0');
    const before = base.players['0'].weapon!;
    const r = play(base).state;
    const w = r.players['0'].weapon!;
    expect(w.cardId).toBe(before.cardId);
    expect(w.attack).toBe(before.attack + 4);
    expect(w.durability).toBe(before.durability);
    expect(w.temporary).toBeUndefined();
    expect(endTurn(r).players['0'].weapon).not.toBeNull(); // the weapon stays...
  });
  it('127 on an equipped weapon: the +4 is gone when the turn ends (a boon, not a permanent buff)', () => {
    const base = withWeapon(setup('CORE_127'), '0');
    const before = base.players['0'].weapon!;
    const r = play(base).state;
    const after = endTurn(r).players['0'].weapon!;
    expect(after.attack).toBe(before.attack);
    expect(after.durability).toBe(before.durability);
    expect(after.tempAttack ?? 0).toBe(0);
    // still gone on the owner's next turn
    expect(backTo(endTurn(r), '0').players['0'].weapon!.attack).toBe(before.attack);
  });
  it('127 twice on one weapon in a turn adds +8, and all of it is taken back at the end of the turn', () => {
    const base = produce(withWeapon(setup('CORE_127'), '0'), (g) => {
      g.players['0'].hand.push({ ...g.players['0'].hand[0] });
      g.players['0'].energy = { current: 10, total: 10 };
    });
    const before = base.players['0'].weapon!.attack;
    const once = play(base).state;
    const twice = play(once).state;
    expect(twice.players['0'].weapon!.attack).toBe(before + 8);
    expect(endTurn(twice).players['0'].weapon!.attack).toBe(before);
  });
  it('127 +4 is used by the swing on the turn it is played', () => {
    const base = withWeapon(setup('CORE_127'), '0');
    const before = base.players['0'].weapon!;
    const r = play(base).state;
    const hit = run(r, { type: 'WeaponAttack', target: hero('1') });
    if ('error' in hit) throw new Error(hit.error);
    expect(hit.state.players['1'].health).toBe(30 - (before.attack + 4));
  });
  it('an ordinary weapon is NOT removed at end of turn', () => {
    expect(endTurn(withWeapon(setup('GRUNT'), '0')).players['0'].weapon).not.toBeNull();
  });
});

describe('081 Reckoning: restore 2 HP before every attack', () => {
  const equipped = (hp = 20) => play(setup('CORE_081', { heroHp: { '0': hp } })).state;
  it('heals before the attack, so counter-damage can not be pre-empted', () => {
    const s = produce(equipped(), (g) => {
      g.players['1'].board.push({ ...setup('GRUNT', { theirs: [[3, 9]] }).players['1'].board[0] });
    });
    const target = mref(s, '1', 0);
    const r = run(s, { type: 'WeaponAttack', target });
    if ('error' in r) throw new Error(r.error);
    expect(r.state.players['0'].health).toBe(20 + 2 - 3);
  });
  it('heals on every attack, capped at 30, and not at all on a refused attack', () => {
    expect(('error' in run(equipped(), { type: 'WeaponAttack', target: hero('0') }))).toBe(true);
    const r = run(equipped(29), { type: 'WeaponAttack', target: hero('1') });
    if ('error' in r) throw new Error(r.error);
    expect(r.state.players['0'].health).toBe(30);
    const again = run(backTo(endTurn(r.state), '0'), { type: 'WeaponAttack', target: hero('1') });
    if ('error' in again) throw new Error(again.error);
    expect(again.state.players['1'].health).toBe(30 - 3 - 3);
  });
});

describe('084: obtain a random card your opponent has already played', () => {
  it('the engine remembers cards each player has played', () => {
    const r = play(setup('CORE_053'), hero('1')).state;
    expect(r.played['0']).toEqual(['CORE_053']);
    expect(r.played['1']).toEqual([]);
  });
  it('adds a copy of one of them to your hand; nothing if none', () => {
    const s = produce(setup('CORE_084'), (g) => {
      g.played['1'] = ['CORE_053', 'CORE_069'];
      g.played['0'] = ['CORE_101']; // your own history is not used
    });
    const seen = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) {
      const hand = play(s, undefined, seed).state.players['0'].hand;
      expect(hand).toHaveLength(1);
      seen.add(hand[0].cardId);
    }
    expect(Array.from(seen).sort()).toEqual(['CORE_053', 'CORE_069']);
    expect(play(setup('CORE_084')).state.players['0'].hand).toHaveLength(0);
  });
  it('a full hand burns the obtained card', () => {
    const s = produce(setup('CORE_084', { hand: Array(10).fill('GRUNT') }), (g) => {
      g.played['1'] = ['CORE_053'];
    });
    expect(play(s).state.players['0'].hand).toHaveLength(10);
  });
});

describe('050 and 091', () => {
  it('050 deals 3 to the chosen enemy and 1 to every other enemy (hero included)', () => {
    const s = setup('CORE_050', { mine: [[1, 5]], theirs: [[1, 9], [1, 9]] });
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '1')).toEqual([[1, 6], [1, 8]]);
    expect(r.players['1'].health).toBe(29);
    expect(stats(r, '0')).toEqual([[1, 5]]);
    expect(r.players['0'].health).toBe(30);
    const hh = play(s, hero('1')).state;
    expect(hh.players['1'].health).toBe(27);
    expect(stats(hh, '1')).toEqual([[1, 8], [1, 8]]);
    expect(failCode(s, mref(s, '0', 0))).toBe('ILLEGAL_TARGET');
  });
  it('091 deals 2 to all enemies and heals 1 to all friendlies', () => {
    let s = setup('CORE_091', { mine: [[1, 5]], theirs: [[1, 9]], heroHp: { '0': 20 } });
    s = hurt(s, '0', 0, 2);
    const r = play(s).state;
    expect(r.players['1'].health).toBe(28);
    expect(stats(r, '1')).toEqual([[1, 7]]);
    expect(r.players['0'].health).toBe(21);
    expect(stats(r, '0')).toEqual([[1, 3]]);
  });
});
