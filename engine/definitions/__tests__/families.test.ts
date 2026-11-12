import { legalActions } from '../../rules/legal-actions';
import { backTo, catalog, endTurn, failCode, hero, hurt, minion, mref, play, realCard, run, setup, stats, withWeapon } from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// The choose-one, overload and enrage families after the distance rewrite (balance/PRIME-DISTANCE.md).

const ids = '111 112 113 115 119 120 121 123 124 200 202 203 204 205 208 209 213 009 022 024 035 041 244 006'.split(' ');
it.each(ids)('PRIME_%s is defined and playable', (n) => {
  const s = setup(`PRIME_${n}`, { mine: [[1, 3]], theirs: [[1, 3]] });
  const t = n === '119' ? hurt(s, '1', 0, 1) : s; // 119's damage option needs a damaged minion; its other option does not
  expect(legalActions(t, '0', catalog).some((a) => a.type === 'PlayCard' && a.handIndex === 0)).toBe(true);
});

const choose = (id: string, choice: number, opts: Parameters<typeof setup>[1], target?: ReturnType<typeof hero>) => {
  const s = setup(id, opts);
  const r = run(s, { type: 'PlayCard', handIndex: 0, choice, target } as Action);
  if ('error' in r) throw new Error(r.error);
  return r.state;
};

describe('choose-one cards', () => {
  it('PRIME_111: +1/+1 to your Creatures only, or a 3/2 with Rush', () => {
    const buffed = choose('PRIME_111', 0, { mine: [[2, 2, 'CORE_070a'], [2, 2, 'PRIME_061']], theirs: [[2, 2, 'CORE_070a']] });
    expect(stats(buffed, '0')).toEqual([[3, 3], [2, 2]]); // the second is not a Creature
    expect(stats(buffed, '1')).toEqual([[2, 2]]);
    const cub = choose('PRIME_111', 1, {});
    expect(stats(cub, '0')).toEqual([[3, 2]]);
    expect(minion(cub, '0', 0).keywords.rush).toBe(true);
  });
  it('PRIME_112: 2 damage and 2 Armor, or 1 damage and a card', () => {
    const a = choose('PRIME_112', 0, {}, hero('1'));
    expect([a.players['1'].health, a.players['0'].armor]).toEqual([28, 2]);
    const s = setup('PRIME_112');
    const b = choose('PRIME_112', 1, {}, hero('1'));
    expect([b.players['1'].health, b.players['0'].hand.length]).toEqual([29, s.players['0'].hand.length]);
  });
  it('PRIME_113: +3 Attack and Rush, or +3 Health, Guard and heal your hero 3', () => {
    const o = { mine: [[1, 1]] as [number, number][], heroHp: { '0': 20 } };
    const t = mref(setup('PRIME_113', o), '0', 0);
    const a = minion(choose('PRIME_113', 0, o, t), '0', 0);
    expect([a.attack, a.keywords.rush]).toEqual([4, true]);
    const bs = choose('PRIME_113', 1, o, t);
    expect([minion(bs, '0', 0).health, minion(bs, '0', 0).keywords.guard, bs.players['0'].health]).toEqual([4, true, 23]);
  });
  it('PRIME_120: 4 to a minion and 1 to its neighbours, or 1 to all enemy minions and Disable them', () => {
    const o = { theirs: [[1, 5], [1, 5], [1, 5]] as [number, number][] };
    const t = mref(setup('PRIME_120', o), '1', 1);
    expect(stats(choose('PRIME_120', 0, o, t), '1')).toEqual([[1, 4], [1, 1], [1, 4]]);
    const all = choose('PRIME_120', 1, o);
    expect(stats(all, '1').map((x) => x[1])).toEqual([4, 4, 4]);
    expect(all.players['1'].board.every((m) => m.disabledOnTurn !== undefined)).toBe(true);
  });
  it('PRIME_121: +1 energy slot and a card, or 2 cards that cost 1 less', () => {
    const low = setup('PRIME_121');
    const five = { ...low, players: { ...low.players, '0': { ...low.players['0'], energy: { current: 6, total: 5 } } } };
    const ra = run(five, { type: 'PlayCard', handIndex: 0, choice: 0 } as Action);
    expect('error' in ra ? -1 : ra.state.players['0'].energy.total).toBe(6);
    expect('error' in ra ? -1 : ra.state.players['0'].hand.length).toBe(1);
    const s = setup('PRIME_121');
    const b = choose('PRIME_121', 1, {});
    expect(b.players['0'].hand).toHaveLength(2);
    expect(b.players['0'].hand.every((c) => c.costDelta === -1)).toBe(true);
    expect(s.players['0'].hand).toHaveLength(1);
  });
  it('PRIME_123: draw 2 and take 2, or heal 5 and Bubble a friendly minion', () => {
    const a = choose('PRIME_123', 0, {});
    expect([a.players['0'].hand.length, a.players['0'].health]).toEqual([2, 28]);
    const o = { mine: [[1, 1]] as [number, number][], heroHp: { '0': 20 } };
    const t = mref(setup('PRIME_123', o), '0', 0);
    const b = choose('PRIME_123', 1, o, t);
    expect([b.players['0'].health, minion(b, '0', 0).keywords.bubble]).toEqual([25, true]);
  });
  it('PRIME_115 (5/3): Rush and +1 Attack, or +3 Health and Guard', () => {
    const a = minion(choose('PRIME_115', 0, {}), '0', 0);
    expect([a.attack, a.health, a.keywords.rush, a.keywords.guard]).toEqual([6, 3, true, false]);
    const b = minion(choose('PRIME_115', 1, {}), '0', 0);
    expect([b.attack, b.health, b.keywords.rush, b.keywords.guard]).toEqual([5, 6, false, true]);
  });
  it('PRIME_124 (4/6): +3 Attack and Rush, or +3 Health, Guard and heal 3', () => {
    const a = minion(choose('PRIME_124', 0, {}), '0', 0);
    expect([a.attack, a.health, a.keywords.rush]).toEqual([7, 6, true]);
    const b = choose('PRIME_124', 1, { heroHp: { '0': 20 } });
    expect([minion(b, '0', 0).health, minion(b, '0', 0).keywords.guard, b.players['0'].health]).toEqual([9, true, 23]);
  });
  it('PRIME_119 (2/3): 2 damage to a DAMAGED minion only, or Suppress with -1 Attack', () => {
    const s = hurt(setup('PRIME_119', { theirs: [[3, 5], [3, 5]] }), '1', 1, 4);
    const bad = run(s, { type: 'PlayCard', handIndex: 0, choice: 0, target: mref(s, '1', 0) } as Action);
    expect('error' in bad && bad.error).toBe('ILLEGAL_TARGET');
    const good = run(s, { type: 'PlayCard', handIndex: 0, choice: 0, target: mref(s, '1', 1) } as Action);
    expect('error' in good ? -1 : stats(good.state, '1')[1][1]).toBe(2);
    const sil = run(s, { type: 'PlayCard', handIndex: 0, choice: 1, target: mref(s, '1', 0) } as Action);
    expect('error' in sil ? null : [stats(sil.state, '1')[0][0], sil.state.players['1'].board[0].silenced]).toEqual([2, true]);
  });
});

describe('overload cards', () => {
  it('PRIME_203 deals 3 to a minion (not a hero) and draws only if it dies', () => {
    const s = setup('PRIME_203', { theirs: [[1, 3], [1, 9]] });
    expect(failCode(s, hero('1'))).toBe('ILLEGAL_TARGET');
    const kill = play(s, mref(s, '1', 0)).state;
    expect(kill.players['1'].board).toHaveLength(1);
    expect(kill.players['0'].hand).toHaveLength(1);
    const miss = play(s, mref(s, '1', 1)).state;
    expect(miss.players['0'].hand).toHaveLength(0);
  });
  it('PRIME_208 deals 4 to a minion and 2 to its neighbours', () => {
    const s = setup('PRIME_208', { theirs: [[1, 9], [1, 9], [1, 9]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1').map((x) => x[1])).toEqual([5, 7, 9]);
    expect(stats(play(s, mref(s, '1', 1)).state, '1').map((x) => x[1])).toEqual([7, 5, 7]);
  });
  it('PRIME_209 hits all enemy minions for 2 (not the hero) and Disables any left at 1 Health', () => {
    const r = play(setup('PRIME_209', { theirs: [[1, 3], [1, 9], [1, 2]] })).state;
    expect(stats(r, '1')).toEqual([[1, 1], [1, 7]]); // the 2-Health one died
    expect(r.players['1'].board[0].disabledOnTurn).toBeDefined();
    expect(r.players['1'].board[1].disabledOnTurn).toBeUndefined();
    expect(r.players['1'].health).toBe(30);
  });
  it('PRIME_202 deals 3 to ONE random enemy', () => {
    const r = play(setup('PRIME_202', { theirs: [[1, 9]] })).state;
    expect(r.players['1'].health + stats(r, '1')[0][1]).toBe(30 + 9 - 3);
  });
  it('PRIME_204 (2/2) Disables whatever it hits, a minion or the hero', () => {
    let s = setup('PRIME_204', { theirs: [[1, 9]] });
    s = play(s).state;
    const hit = run(s, { type: 'WeaponAttack', target: mref(s, '1', 0) } as Action);
    expect('error' in hit ? null : hit.state.players['1'].board[0].disabledOnTurn).toBeDefined();
    const face = run(s, { type: 'WeaponAttack', target: hero('1') } as Action);
    expect('error' in face ? null : face.state.players['1'].heroDisabledOnTurn).toBeDefined();
  });
  it('PRIME_200 (2/1 Onslaught) dies at the end of your turn only if it attacked twice', () => {
    let s = setup('CORE_043', { mine: [[2, 3, 'PRIME_200']], theirs: [[1, 50]] });
    s = play(s).state;
    const id = s.players['0'].board[0].instanceId;
    const once = run(s, { type: 'Attack', attackerId: id, target: hero('1') } as Action);
    if ('error' in once) throw new Error(once.error);
    expect(endTurn(once.state).players['0'].board).toHaveLength(1);
    const twice = run(once.state, { type: 'Attack', attackerId: id, target: hero('1') } as Action);
    if ('error' in twice) throw new Error(twice.error);
    expect(endTurn(twice.state).players['0'].board).toHaveLength(0);
  });
  it('PRIME_213 (6/7 Guard) heals its owner 1 when attacked', () => {
    let s = setup('CORE_043', { mine: [[1, 9, 'PRIME_213']], theirs: [[1, 9]], heroHp: { '0': 20 } });
    s = endTurn(play(s).state);
    const r = run(s, { type: 'Attack', attackerId: s.players['1'].board[0].instanceId, target: mref(s, '0', 0) } as Action);
    expect('error' in r ? -1 : r.state.players['0'].health).toBe(21);
  });
  it('PRIME_205 grows for an Overcharge card played by EITHER player', () => {
    const s = setup('PRIME_203', { mine: [[2, 4, 'PRIME_205']], theirs: [[1, 9]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '0')[0]).toEqual([3, 5]); // my own
    let t = endTurn(play(setup('CORE_043', { mine: [[2, 4, 'PRIME_205'], [1, 9]] })).state);
    t = { ...t, players: { ...t.players, '1': { ...t.players['1'], hand: [{ instanceId: 5001, cardId: 'PRIME_203' }], energy: { current: 10, total: 10 } } } };
    const r = run(t, { type: 'PlayCard', handIndex: 0, target: mref(t, '0', 1) } as Action);
    expect('error' in r ? null : stats(r.state, '0')[0]).toEqual([3, 5]); // the opponent's
    const plain = setup('PRIME_034', { mine: [[2, 4, 'PRIME_205']] });
    expect(stats(play(plain).state, '0')[0]).toEqual([2, 4]); // no Overcharge, no growth
  });
});
describe('enrage family', () => {
  const settled = (id: string, mutate: (s: GameState) => GameState = (s) => s, mine: [number, number][] = []) => {
    const c = realCard(id);
    return play(mutate(setup('CORE_043', { mine: [[c.attack ?? 0, c.health ?? 1, id], ...mine] }))).state;
  };
  it('PRIME_009 (1/4): +2 Attack and Rush while damaged', () => {
    const calm = minion(settled('PRIME_009'), '0', 0);
    expect([calm.attack, calm.keywords.rush]).toEqual([1, false]);
    const hurtOne = minion(settled('PRIME_009', (s) => hurt(s, '0', 0, 3)), '0', 0);
    expect([hurtOne.attack, hurtOne.keywords.rush]).toEqual([3, true]);
  });
  it('PRIME_035 (3/6): +1 Attack per damage taken, capped at +4', () => {
    expect(minion(settled('PRIME_035', (s) => hurt(s, '0', 0, 4)), '0', 0).attack).toBe(5);
    expect(minion(settled('PRIME_035', (s) => hurt(s, '0', 0, 1)), '0', 0).attack).toBe(7);
  });
  it('PRIME_041 (1/2) gains +1 Attack each time it is damaged and keeps it', () => {
    let s = setup('CORE_043', { mine: [[1, 5, 'PRIME_041']], theirs: [[1, 9]] });
    s = endTurn(play(s).state);
    const hit = run(s, { type: 'Attack', attackerId: s.players['1'].board[0].instanceId, target: mref(s, '0', 0) } as Action);
    if ('error' in hit) throw new Error(hit.error);
    expect(stats(hit.state, '0')[0]).toEqual([2, 4]);
  });
  it('PRIME_024 (2/4 Guard) heals 1 each time it is damaged', () => {
    let s = setup('CORE_043', { mine: [[2, 4, 'PRIME_024']], theirs: [[1, 9]] });
    s = endTurn(play(s).state);
    const hit = run(s, { type: 'Attack', attackerId: s.players['1'].board[0].instanceId, target: mref(s, '0', 0) } as Action);
    if ('error' in hit) throw new Error(hit.error);
    expect(stats(hit.state, '0')[0][1]).toBe(4); // 4 - 1 + 1
  });
  it('PRIME_244 (4/8 Rush) has Onslaught only while damaged', () => {
    expect(minion(settled('PRIME_244'), '0', 0).keywords.doubleAttack).toBe(false);
    expect(minion(settled('PRIME_244', (s) => hurt(s, '0', 0, 7)), '0', 0).keywords.doubleAttack).toBe(true);
    expect(minion(settled('PRIME_244', (s) => hurt(s, '0', 0, 7)), '0', 0).attack).toBe(4);
  });
  it('PRIME_022 (3/3) has Onslaught only on turns your hero took damage', () => {
    expect(minion(settled('PRIME_022'), '0', 0).keywords.doubleAttack).toBe(false);
    const burned = settled('PRIME_022', (s) => ({ ...s, players: { ...s.players, '0': { ...s.players['0'], heroHurtOnTurn: s.turn } } }));
    expect(minion(burned, '0', 0).keywords.doubleAttack).toBe(true);
    const old = settled('PRIME_022', (s) => ({ ...s, players: { ...s.players, '0': { ...s.players['0'], heroHurtOnTurn: s.turn - 1 } } }));
    expect(minion(old, '0', 0).keywords.doubleAttack).toBe(false);
  });
  it('PRIME_022 notices real damage to the hero', () => {
    const s = settled('PRIME_022');
    const dmg = play({ ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [{ instanceId: 4000, cardId: 'PRIME_217' }] } } }).state; // Darksoul hurts your own hero
    expect(minion(dmg, '0', 0).keywords.doubleAttack).toBe(true);
  });
  it('PRIME_006 (1/2): +1 Attack and Rush only while you have a weapon', () => {
    const plain = minion(settled('PRIME_006'), '0', 0);
    expect([plain.attack, plain.keywords.rush]).toEqual([1, false]);
    const armed = minion(play(withWeapon(setup('CORE_043', { mine: [[1, 2, 'PRIME_006']] }), '0')).state, '0', 0);
    expect([armed.attack, armed.keywords.rush]).toEqual([2, true]);
  });
});
