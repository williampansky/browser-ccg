import { legalActions } from '../../rules/legal-actions';
import { catalog, endTurn, failCode, hero, hurt, minion, mref, play, realCard, run, setup, stats, withWeapon } from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// Mysteries: placed face down, react on the OPPONENT's turn only, one at a time. Player 0 sets the Mystery; player 1 acts.

const ids = ['143', '127', '148', '126', '157', '152', '146', '159', '129', '158', '156', '132', '067', '250', '149', '045'];
it.each(ids)('PRIME_%s is defined', (n) => {
  const s = setup(`PRIME_${n}`, { theirs: [[1, 3]] });
  expect(legalActions(s, '0', catalog).some((a) => a.type === 'PlayCard' && a.handIndex === 0)).toBe(true);
});

/** P0 plays `id` (a Mystery) with `mine` on the board, ends the turn, and it is P1's turn with `theirs` on the board. */
const armed = (id: string, opts: Parameters<typeof setup>[1] = {}, weaponForMe = false): GameState => {
  let s = setup(id, opts);
  if (weaponForMe) s = withWeapon(s, '0');
  return endTurn(play(s).state);
};
const act = (s: GameState, a: Action) => {
  const r = run(s, a);
  if ('error' in r) throw new Error(r.error);
  return r.state;
};
const attackHero = (s: GameState, i = 0) => act(s, { type: 'Attack', attackerId: s.players['1'].board[i].instanceId, target: hero('0') });

describe('placing a Mystery', () => {
  it('goes face down in your slot, takes no board space, and is not "played" for history', () => {
    const s = play(setup('PRIME_143')).state;
    expect(s.players['0'].mystery?.cardId).toBe('PRIME_143');
    expect(s.players['0'].hand).toHaveLength(0);
    expect(s.played['0']).not.toContain('PRIME_143');
  });
  it('only one at a time: a second Mystery cannot be played, and legalActions does not offer it', () => {
    const s = play(setup('PRIME_143', { hand: ['PRIME_127'] })).state;
    expect(failCode(s)).toBe('MYSTERY_ACTIVE');
    expect(legalActions(s, '0', catalog).some((a) => a.type === 'PlayCard')).toBe(false);
  });
  it('does not react on its owner\'s own turn', () => {
    // P0 sets Resurrection, then on the same turn attacks with a 1-Health minion into a 5/5 and loses it.
    const s = play(setup('PRIME_158', { mine: [[1, 1, 'PRIME_062']], theirs: [[5, 5]] })).state;
    const r = act(s, { type: 'Attack', attackerId: s.players['0'].board[0].instanceId, target: mref(s, '1', 0) });
    expect(r.players['0'].board).toHaveLength(0);
    expect(r.players['0'].mystery?.cardId).toBe('PRIME_158'); // still face down, nothing returned
    expect(r.players['0'].hand.some((c) => c.cardId === 'PRIME_062')).toBe(false);
  });
});

describe('reacting to attacks (before the damage)', () => {
  it('PRIME_143 gives Armor equal to twice the attacker\'s Attack (min 4)', () => {
    let s = armed('PRIME_143', { theirs: [[3, 5]] });
    s = attackHero(s);
    expect(s.players['0'].armor).toBe(3); // 6 Armor gained, then the 3-Attack hit took 3 of it
    expect(s.players['0'].health).toBe(30); // the armor soaked the hit
    expect(s.players['0'].mystery).toBeNull();
    const weak = attackHero(armed('PRIME_143', { theirs: [[1, 5]] }));
    expect(weak.players['0'].armor).toBe(4 - 1);
  });
  it('PRIME_127 Disables and weakens the attacker but the attack happens', () => {
    const s = attackHero(armed('PRIME_127', { theirs: [[4, 5]] }));
    expect(s.players['0'].health).toBe(28); // the weakened (4 - 2 = 2 Attack) attacker hits
    expect(stats(s, '1')[0][0]).toBe(2);
    expect(minion(s, '1', 0).disabledOnTurn).toBeDefined();
  });
  it('PRIME_148 deals missing-Health damage to the attacker (and a kill stops the attack)', () => {
    let s = setup('PRIME_148', { theirs: [[5, 9]], heroHp: { '0': 24 } });
    s = attackHero(endTurn(play(s).state));
    expect(stats(s, '1')).toEqual([[5, 3]]); // 6 damage
    expect(s.players['0'].health).toBe(19);
    let k = setup('PRIME_148', { theirs: [[5, 5]], heroHp: { '0': 20 } });
    k = attackHero(endTurn(play(k).state));
    expect(k.players['1'].board).toHaveLength(0);
    expect(k.players['0'].health).toBe(20); // the attacker died first
  });
  it('PRIME_126 hits the attacker with your weapon first, and needs a weapon', () => {
    const s = attackHero(armed('PRIME_126', { theirs: [[3, 2]] }, true));
    expect(s.players['1'].board).toHaveLength(0); // the 2-Attack weapon killed it
    expect(s.players['0'].health).toBe(30);
    const bare = attackHero(armed('PRIME_126', { theirs: [[3, 2]] }));
    expect(bare.players['0'].mystery?.cardId).toBe('PRIME_126'); // nothing happened
  });
  it('PRIME_157 summons two Guard Mice and the attack hits one of them', () => {
    const s = attackHero(armed('PRIME_157', { theirs: [[3, 5]] }));
    expect(s.players['0'].health).toBe(30);
    expect(s.players['0'].board.map((m) => m.keywords.guard)).toEqual([true, true].slice(0, s.players['0'].board.length));
    expect(s.players['0'].board.length).toBeGreaterThanOrEqual(1);
    expect(s.players['0'].board.some((m) => m.health < 1 || m.health === 1)).toBe(true);
  });
  it('PRIME_157 also reacts to a hero weapon attack', () => {
    let s = armed('PRIME_157', { theirs: [[1, 5]] });
    s = withWeapon(s, '1');
    const r = act(s, { type: 'WeaponAttack', target: hero('0') });
    expect(r.players['0'].health).toBe(30);
    expect(r.players['0'].mystery).toBeNull();
  });
});

describe('reacting to spells', () => {
  it('PRIME_152 sends a targeted spell to one of the caster\'s own minions', () => {
    let s = armed('PRIME_152', { mine: [[1, 5]], theirs: [[1, 9]] });
    expect(realCard('CORE_093').type).toBe('spell'); // 3 damage to an unhurt minion
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], hand: [{ instanceId: 777, cardId: 'CORE_093' }], energy: { current: 10, total: 10 } } } };
    const r = act(s, { type: 'PlayCard', handIndex: 0, target: mref(s, '0', 0) });
    expect(stats(r, '0')).toEqual([[1, 5]]); // not hit
    expect(stats(r, '1')).toEqual([[1, 6]]); // hit itself
    expect(r.players['0'].mystery).toBeNull();
  });
  it('PRIME_152 does nothing if the caster has no minion to redirect to', () => {
    let s = armed('PRIME_152', { mine: [[1, 5]] });
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], hand: [{ instanceId: 777, cardId: 'CORE_093' }], energy: { current: 10, total: 10 } } } };
    const r = act(s, { type: 'PlayCard', handIndex: 0, target: mref(s, '0', 0) });
    expect(stats(r, '0')).toEqual([[1, 2]]);
  });
  it('PRIME_146 copies the enemy spell into your hand, and the spell still resolves', () => {
    let s = armed('PRIME_146');
    const handBefore = s.players['0'].hand.length;
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], hand: [{ instanceId: 778, cardId: 'CORE_043' }], energy: { current: 10, total: 10 } } } };
    const r = act(s, { type: 'PlayCard', handIndex: 0 });
    expect(r.players['0'].hand.map((c) => c.cardId)).toContain('CORE_043');
    expect(r.players['0'].hand).toHaveLength(handBefore + 1);
    expect(r.players['0'].mystery).toBeNull();
  });
  it('PRIME_146 ignores items, minions, and a Mystery placed by the enemy', () => {
    let s = armed('PRIME_146');
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], hand: [{ instanceId: 779, cardId: 'PRIME_143' }], energy: { current: 10, total: 10 } } } };
    const r = act(s, { type: 'PlayCard', handIndex: 0 });
    expect(r.players['0'].mystery?.cardId).toBe('PRIME_146');
  });
});

describe('reacting to minions, damage and deaths', () => {
  const p1Plays = (s: GameState, cardId: string): GameState => {
    const t = { ...s, players: { ...s.players, '1': { ...s.players['1'], hand: [{ instanceId: 780, cardId }], energy: { current: 10, total: 10 } } } };
    return act(t, { type: 'PlayCard', handIndex: 0 });
  };
  it('PRIME_159 halves the Health (rounded up) and Disables the minion', () => {
    const r = p1Plays(armed('PRIME_159'), 'PRIME_074'); // 4/5 Guard, no warcry
    const m = minion(r, '1', 0);
    expect([m.attack, m.health]).toEqual([4, 3]);
    expect(m.disabledOnTurn).toBeDefined();
  });
  it('PRIME_129 deals damage equal to the minion\'s Cost', () => {
    const r = p1Plays(armed('PRIME_129'), 'PRIME_074'); // cost 6, 4/5
    expect(r.players['1'].board).toHaveLength(0); // 6 damage kills a 5-Health minion
    const small = p1Plays(armed('PRIME_129'), 'PRIME_033'); // cost 5, 3/6 Guard
    expect(minion(small, '1', 0).health).toBe(1);
  });
  it('PRIME_156 heals 5 and draws when your hero takes 5 or more in one hit', () => {
    let s = armed('PRIME_156', { theirs: [[6, 6]], heroHp: { '0': 20 } });
    const hand = s.players['0'].hand.length;
    s = attackHero(s);
    expect(s.players['0'].health).toBe(19); // 20 - 6 + 5
    expect(s.players['0'].hand.length).toBe(hand + 1);
    const small = attackHero(armed('PRIME_156', { theirs: [[4, 6]], heroHp: { '0': 20 } }));
    expect(small.players['0'].mystery?.cardId).toBe('PRIME_156');
  });
  it('PRIME_158 returns a dying minion of yours to your hand, one cheaper (never a token)', () => {
    let s = setup('PRIME_158', { mine: [[1, 1, 'PRIME_062']], theirs: [[5, 5]] });
    s = endTurn(play(s).state);
    const r = act(s, { type: 'Attack', attackerId: s.players['1'].board[0].instanceId, target: mref(s, '0', 0) });
    const back = r.players['0'].hand.find((c) => c.cardId === 'PRIME_062');
    expect(back?.costDelta).toBe(-1);
    expect(r.players['0'].mystery).toBeNull();
  });
});

describe('Mystery payoffs and removal', () => {
  it('PRIME_250 / 149 buff at the end of your turn only while you have a Mystery', () => {
    const withIt = setup('PRIME_143', { mine: [[3, 3, 'PRIME_250']] });
    expect(stats(endTurn(play(withIt).state), '0')).toEqual([[5, 7]]);
    const without = setup('CORE_043', { mine: [[3, 3, 'PRIME_250']] });
    expect(stats(endTurn(play(without).state), '0')).toEqual([[3, 3]]);
  });
  it('PRIME_045 grows when ANY Mystery is played', () => {
    const s = setup('PRIME_143', { theirs: [[1, 2, 'PRIME_045']] });
    expect(stats(play(s).state, '1')).toEqual([[2, 3]]);
  });
  it('PRIME_132 reveals Concealed minions (1 damage) and destroys the enemy Mystery, drawing only then', () => {
    const s0 = armed('PRIME_143', { theirs: [[2, 3, 'PRIME_007']] });
    // P1 to act: give P1 the spell
    const t = { ...s0, players: { ...s0.players, '1': { ...s0.players['1'], hand: [{ instanceId: 790, cardId: 'PRIME_132' }], energy: { current: 10, total: 10 } } } };
    const hand = t.players['1'].hand.length;
    const r = act(t, { type: 'PlayCard', handIndex: 0 });
    expect(r.players['0'].mystery).toBeNull();
    expect(r.players['1'].hand.length).toBe(hand - 1 + 1);
    expect(minion(r, '1', 0).keywords.hidden).toBe(false);
    expect(minion(r, '1', 0).health).toBe(2); // 3 - 1
  });
  it('PRIME_067 takes the enemy Mystery for you', () => {
    let s = armed('PRIME_143');
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], hand: [{ instanceId: 791, cardId: 'PRIME_067' }], energy: { current: 10, total: 10 } } } };
    const r = act(s, { type: 'PlayCard', handIndex: 0 });
    expect(r.players['0'].mystery).toBeNull();
    expect(r.players['1'].mystery?.cardId).toBe('PRIME_143');
  });
});
