import { produce } from 'immer';
import { legalActions } from '../../rules/legal-actions';
import { effectiveCost } from '../../rules/cost';
import { catalog, endTurn, failCode, hero, mref, play, realCard, run, setup, stats } from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// Suppress (SILENCE): a minion loses its card's behaviour and its keywords; stats, damage and buffs stay.

const withKeywords = (s: GameState, player: '0' | '1', i: number, k: object) =>
  produce(s, (g) => void Object.assign(g.players[player].board[i].keywords, k));

describe('Suppress cards are defined', () => {
  it.each(['020', '032', '171', '201', '178', '119'])('PRIME_%s is playable', (n) => {
    expect(failCode(setup(`PRIME_${n}`, { theirs: [[1, 3]] }), mref(setup(`PRIME_${n}`, { theirs: [[1, 3]] }), '1', 0))).not.toBe('UNSUPPORTED_CARD');
  });
});

describe('what Suppress removes', () => {
  it('keywords, and Can\'t Attack, but not stats or damage', () => {
    let s = setup('PRIME_171', { theirs: [[3, 5]] });
    s = withKeywords(s, '1', 0, { guard: true, bubble: true, rush: true, doubleAttack: true, noAttack: true });
    s = produce(s, (g) => void (g.players['1'].board[0].health = 4));
    const m = play(s, mref(s, '1', 0)).state.players['1'].board[0];
    expect(m.keywords).toEqual({ guard: false, rush: false, bubble: false, doubleAttack: false, hidden: false, noAttack: false });
    expect([m.attack, m.health, m.maxHealth]).toEqual([3, 4, 5]);
    expect(m.silenced).toBe(true);
  });
  it('removes a Disable', () => {
    let s = setup('PRIME_171', { theirs: [[3, 5]] });
    s = produce(s, (g) => void (g.players['1'].board[0].disabledOnTurn = 4));
    expect(play(s, mref(s, '1', 0)).state.players['1'].board[0].disabledOnTurn).toBeUndefined();
  });
  it('removes demise', () => {
    const s = setup('PRIME_171', { mine: [[1, 1, 'PRIME_013']] });
    const r = produce(play(s, mref(s, '0', 0)).state, (g) => void (g.players['0'].board[0].health = 0));
    // a later action settles the death: end the turn
    expect(endTurn(r).players['0'].hand.length).toBe(r.players['0'].hand.length); // no draw from Ploofer
    const unsilenced = produce(setup('CORE_043', { mine: [[1, 1, 'PRIME_013']] }), (g) => void (g.players['0'].board[0].health = 0));
    expect(play(unsilenced).state.players['0'].hand.length).toBe(1); // control: the demise does draw
  });
  it('removes triggers', () => {
    const s = setup('PRIME_171', { mine: [[1, 1, 'PRIME_141']], hand: ['CORE_043'] });
    const r = play(s, mref(s, '0', 0)).state;
    const r2 = run(r, { type: 'PlayCard', handIndex: 0 } as Action);
    expect('error' in r2 ? 0 : stats(r2.state, '0')[0][0]).toBe(1); // Fierce Gremlin no longer grows
  });
  it('removes an aura at once', () => {
    const s = setup('PRIME_171', { mine: [[1, 1, 'PRIME_225'], [2, 2]] });
    const withAura = play(setup('CORE_043', { mine: [[1, 1, 'PRIME_225'], [2, 2]] })).state;
    expect(stats(withAura, '0')[1][0]).toBe(3);
    expect(stats(play(s, mref(s, '0', 0)).state, '0')[1][0]).toBe(2);
  });
  it('removes a cost reduction', () => {
    const s = setup('PRIME_171', { mine: [[0, 4, 'PRIME_220']] });
    const r = play(s, mref(s, '0', 0)).state;
    expect(effectiveCost(r, '0', realCard('PRIME_034'), catalog)).toBe(5);
  });
  it('removes Spell Damage', () => {
    const s = setup('PRIME_171', { mine: [[1, 1, 'CORE_011']], hand: ['CORE_125'], theirs: [[1, 9]] });
    expect(realCard('CORE_011').mechanics).toContain('SPELL_DAMAGE');
    const control = setup('CORE_125', { mine: [[1, 1, 'CORE_011']], theirs: [[1, 9]] });
    expect(stats(play(control).state, '1')[0][1]).toBe(6); // 2 damage + 1 Spell Damage
    const silenced = play(s, mref(s, '0', 0)).state;
    const r = run(silenced, { type: 'PlayCard', handIndex: 0 } as Action);
    expect('error' in r ? -1 : stats(r.state, '1')[0][1]).toBe(7);
  });
});

describe('the cards', () => {
  it('PRIME_020 / 032 / 171 aim at minions only, either side', () => {
    for (const id of ['PRIME_020', 'PRIME_032', 'PRIME_171']) {
      const s = setup(id, { mine: [[1, 1]], theirs: [[1, 1]] });
      expect(failCode(s, hero('1'))).toBe('ILLEGAL_TARGET');
      expect(play(s, mref(s, '0', 0)).state.players['0'].board[0].silenced).toBe(true);
      expect(play(s, mref(s, '1', 0)).state.players['1'].board[0].silenced).toBe(true);
    }
  });
  it('PRIME_201 silences first, so a 1-health demise minion dies without its demise', () => {
    const s = setup('PRIME_201', { theirs: [[1, 1, 'PRIME_004']] }); // Soul Miner: demise 2 damage to the enemy hero (me)
    const r = play(s, mref(s, '1', 0)).state;
    expect(r.players['1'].board).toHaveLength(0);
    expect(r.players['0'].health).toBe(30);
    const control = setup('CORE_001', { theirs: [[1, 1, 'PRIME_004']] });
    expect(play(control, mref(control, '1', 0)).state.players['0'].health).toBe(28);
  });
  it('PRIME_178 silences every minion, then draws', () => {
    const r = play(setup('PRIME_178', { mine: [[1, 1]], theirs: [[1, 1]] })).state;
    expect([r.players['0'].board[0].silenced, r.players['1'].board[0].silenced]).toEqual([true, true]);
    expect(r.players['0'].hand).toHaveLength(1);
  });
  it('legalActions offers a choose-one minion once per option', () => {
    const s = setup('PRIME_119', { theirs: [[1, 5]] });
    const plays = legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard' && a.handIndex === 0);
    expect(new Set(plays.map((a) => (a as { choice?: number }).choice))).toEqual(new Set([0, 1]));
  });
});
