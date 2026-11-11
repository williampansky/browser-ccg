import { isPlayable } from '../../decks';
import { getCardDef } from '..';
import { failCode, hero, mref, play, realCard, setup, stats } from '../../testing/real-cards';

// Batch A: cards built only from simple effects (damage, heal, draw, buff, summon, energy).
// Every test plays the REAL card from data/hs, so the numbers in the card data are what is checked.

const ids = [
  ...['006', '016', '036', '054', '112', '026', '082', '019', '032', '041', '122', '020', '025'],
  ...['053', '083', '058', '120', '069', '072', '079', '121', '124', '060', '125'],
  ...['047', '077', '087', '073', '078', '067', '049'],
].map((n) => `CORE_${n}`);

describe('Batch A cards are all defined and playable', () => {
  it.each(ids)('%s', (id) => {
    expect(getCardDef(realCard(id))).toBeDefined();
    expect(isPlayable(realCard(id))).toBe(true);
  });
});

describe('targeted warcries', () => {
  it('006 heals a friendly character for 2 (hero or minion), never an enemy', () => {
    const s = setup('CORE_006', { mine: [[2, 3]], heroHp: { '0': 20 } });
    const hurt = { ...s, players: { ...s.players, '0': { ...s.players['0'], board: [{ ...s.players['0'].board[0], health: 1 }] } } };
    expect(play(hurt, hero('0')).state.players['0'].health).toBe(22);
    expect(stats(play(hurt, mref(hurt, '0', 0)).state, '0')[0]).toEqual([2, 3]);
    expect(failCode(hurt, hero('1'))).toBe('ILLEGAL_TARGET');
  });
  it.each([
    ['CORE_016', 1],
    ['CORE_036', 2],
    ['CORE_112', 3],
  ])('%s deals %i damage to the chosen character', (id, dmg) => {
    const s = setup(id, { theirs: [[1, 9]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')[0][1]).toBe(9 - dmg);
    expect(play(s, hero('1')).state.players['1'].health).toBe(30 - dmg);
  });
  it('054 gives a friendly minion +1 Health (not attack)', () => {
    const s = setup('CORE_054', { mine: [[2, 3]] });
    expect(stats(play(s, mref(s, '0', 0)).state, '0')[0]).toEqual([2, 4]);
    const t = setup('CORE_054', { theirs: [[2, 3]] });
    expect(failCode(t, mref(t, '1', 0))).toBe('ILLEGAL_TARGET');
  });
});

describe('untargeted warcries', () => {
  it('026 draws a card', () => {
    const s = setup('CORE_026');
    expect(play(s).state.players['0'].hand).toHaveLength(1);
  });
  it('082 heals your hero for 6 (capped at 30)', () => {
    expect(play(setup('CORE_082', { heroHp: { '0': 10 } })).state.players['0'].health).toBe(16);
    expect(play(setup('CORE_082', { heroHp: { '0': 28 } })).state.players['0'].health).toBe(30);
  });
  it('019 gives your OTHER minions +1 Health (not attack), and only yours', () => {
    const s = setup('CORE_019', { mine: [[2, 3]], theirs: [[2, 3]] });
    const r = play(s).state;
    expect(stats(r, '0')[0]).toEqual([2, 4]);
    expect(stats(r, '0')[1]).toEqual([2, 2]); // the 019 minion itself is unchanged
    expect(stats(r, '1')[0]).toEqual([2, 3]);
  });
  it('041 gives your other minions +1/+1', () => {
    const s = setup('CORE_041', { mine: [[2, 3]], theirs: [[2, 3]] });
    const r = play(s).state;
    expect(stats(r, '0')[0]).toEqual([3, 4]);
    expect(stats(r, '1')[0]).toEqual([2, 3]);
    expect(stats(r, '0')[1]).toEqual([6, 6]);
  });
  it('032 heals 2 to your hero and all your minions, not the enemy', () => {
    let s = setup('CORE_032', { mine: [[2, 3]], theirs: [[2, 3]], heroHp: { '0': 20, '1': 20 } });
    s = {
      ...s,
      players: {
        '0': { ...s.players['0'], board: [{ ...s.players['0'].board[0], health: 1 }] },
        '1': { ...s.players['1'], board: [{ ...s.players['1'].board[0], health: 1 }] },
      },
    };
    const r = play(s).state;
    expect(r.players['0'].health).toBe(22);
    expect(r.players['0'].board[0].health).toBe(3);
    expect(r.players['1'].health).toBe(20);
    expect(r.players['1'].board[0].health).toBe(1);
  });
  it('122 deals 1 to everyone else: both heroes and every other minion, not itself', () => {
    const s = setup('CORE_122', { mine: [[2, 3]], theirs: [[2, 3]] });
    const r = play(s).state;
    expect(r.players['0'].health).toBe(29);
    expect(r.players['1'].health).toBe(29);
    expect(stats(r, '0')).toEqual([[2, 2], [6, 6]]);
    expect(stats(r, '1')).toEqual([[2, 2]]);
  });
  it.each([
    ['CORE_020', 1, 1],
    ['CORE_025', 2, 1],
  ])('%s summons its token beside it', (id, atk, hp) => {
    const r = play(setup(id)).state;
    expect(r.players['0'].board).toHaveLength(2);
    expect(stats(r, '0')[1]).toEqual([atk, hp]);
  });
  it('a summon warcry on a full board still plays the minion and summons nothing', () => {
    const six = Array(6).fill([1, 1]) as [number, number][];
    expect(play(setup('CORE_020', { mine: six })).state.players['0'].board).toHaveLength(7);
  });
});

describe('damage spells', () => {
  it.each([
    ['CORE_053', 2],
    ['CORE_083', 2],
    ['CORE_058', 4],
    ['CORE_120', 4],
    ['CORE_069', 6],
  ])('%s deals %i to a chosen character', (id, dmg) => {
    const s = setup(id, { theirs: [[1, 9]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')[0][1]).toBe(9 - dmg);
    expect(play(s, hero('1')).state.players['1'].health).toBe(30 - dmg);
    expect(play(s, hero('0')).state.players['0'].health).toBe(30 - dmg); // you may hit yourself
  });
  it('a targeted spell with no target is refused', () => {
    expect(failCode(setup('CORE_053'))).toBe('ILLEGAL_TARGET');
  });
  it('072 deals 4 to every enemy minion, not the hero or your own', () => {
    const r = play(setup('CORE_072', { mine: [[1, 9]], theirs: [[1, 9], [1, 3]] })).state;
    expect(stats(r, '1')).toEqual([[1, 5]]); // the 3-health one died
    expect(stats(r, '0')).toEqual([[1, 9]]);
    expect(r.players['1'].health).toBe(30);
  });
  it('079 deals 2 to the enemy hero and all enemy minions', () => {
    const r = play(setup('CORE_079', { mine: [[1, 9]], theirs: [[1, 9]] })).state;
    expect(r.players['1'].health).toBe(28);
    expect(stats(r, '1')).toEqual([[1, 7]]);
    expect(r.players['0'].health).toBe(30);
    expect(stats(r, '0')).toEqual([[1, 9]]);
  });
  it('121 deals 3 to everyone', () => {
    const r = play(setup('CORE_121', { mine: [[1, 9]], theirs: [[1, 9]] })).state;
    expect([r.players['0'].health, r.players['1'].health]).toEqual([27, 27]);
    expect([stats(r, '0')[0][1], stats(r, '1')[0][1]]).toEqual([6, 6]);
  });
  it('124 deals 1 to ALL minions but no heroes', () => {
    const r = play(setup('CORE_124', { mine: [[1, 9]], theirs: [[1, 9]] })).state;
    expect([stats(r, '0')[0][1], stats(r, '1')[0][1]]).toEqual([8, 8]);
    expect([r.players['0'].health, r.players['1'].health]).toEqual([30, 30]);
  });
  it('060 deals 2 to each of two DIFFERENT random enemies', () => {
    const s = setup('CORE_060', { theirs: [[1, 9], [1, 9]] });
    for (let seed = 1; seed <= 8; seed++) {
      const r = play(s, undefined, seed).state;
      const hits = [r.players['1'].health, ...r.players['1'].board.map((m) => m.health)].map((h, i) => (i === 0 ? 30 : 9) - h);
      expect(hits.filter((h) => h === 2)).toHaveLength(2);
      expect(hits.filter((h) => h === 0)).toHaveLength(1);
    }
  });
  it('125 deals 2 to two different random enemy MINIONS, never the hero', () => {
    const s = setup('CORE_125', { theirs: [[1, 9], [1, 9], [1, 9]] });
    for (let seed = 1; seed <= 8; seed++) {
      const r = play(s, undefined, seed).state;
      expect(r.players['1'].health).toBe(30);
      expect(r.players['1'].board.filter((m) => m.health === 7)).toHaveLength(2);
    }
    const lone = setup('CORE_125', { theirs: [[1, 9]] });
    expect(stats(play(lone).state, '1')).toEqual([[1, 7]]);
    expect(play(setup('CORE_125')).state.players['1'].health).toBe(30);
  });
});

describe('heals, buffs and other items', () => {
  it.each([
    ['CORE_047', 8],
    ['CORE_077', 6],
  ])('%s heals %i to a chosen character, capped at max', (id, amt) => {
    const s = setup(id, { heroHp: { '1': 5 } });
    expect(play(s, hero('1')).state.players['1'].health).toBe(Math.min(30, 5 + amt));
    expect(failCode(s)).toBe('ILLEGAL_TARGET');
  });
  it('087 heals your own hero for 5 with no target', () => {
    expect(play(setup('CORE_087', { heroHp: { '0': 10 } })).state.players['0'].health).toBe(15);
    expect(failCode(setup('CORE_087'), hero('0'))).toBe('ILLEGAL_TARGET');
  });
  it.each([
    ['CORE_073', 3, 0],
    ['CORE_078', 4, 4],
  ])('%s buffs a minion by +%i/+%i', (id, a, h) => {
    const s = setup(id, { theirs: [[2, 3]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')[0]).toEqual([2 + a, 3 + h]);
    expect(failCode(s, hero('1'))).toBe('ILLEGAL_TARGET');
  });
  it('067 draws 2 cards', () => {
    expect(play(setup('CORE_067')).state.players['0'].hand).toHaveLength(2);
  });
  it('049 adds an empty energy slot (capped at 10)', () => {
    const base = setup('CORE_049');
    const s = { ...base, players: { ...base.players, '0': { ...base.players['0'], energy: { current: 5, total: 4 } } } };
    const r = play(s).state.players['0'].energy;
    expect(r).toEqual({ current: 5 - 3, total: 5 });
    const full = { ...base, players: { ...base.players, '0': { ...base.players['0'], energy: { current: 10, total: 10 } } } };
    expect(play(full).state.players['0'].energy.total).toBe(10);
  });
});
