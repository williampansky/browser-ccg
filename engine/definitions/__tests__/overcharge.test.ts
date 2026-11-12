import { backTo, catalog, endTurn, failCode, hero, mref, play, realCard, setup, stats } from '../../testing/real-cards';
import { legalActions } from '../../rules/legal-actions';
import { setEnergy } from '../../testing/builders';

// Overcharge (N): playing the card locks N energy at the start of your NEXT turn.

const nextTurnEnergy = (s: ReturnType<typeof setup>) => backTo(endTurn(s), '0').players['0'].energy;

describe('Overcharge cards are defined and playable', () => {
  it.each(['204', '200', '213', '209', '208', '203', '202', '205'])('PRIME_%s', (n) => {
    const s = setup(`PRIME_${n}`, { theirs: [[1, 3]] });
    expect(legalActions(s, '0', catalog).some((a) => a.type === 'PlayCard' && a.handIndex === 0)).toBe(true);
  });
});

describe('the lock', () => {
  it('a card with Overcharge (N) locks N of the next turn\'s energy, then it is gone', () => {
    const base = setup('PRIME_203');
    const s = setEnergy(play(base, hero('1')).state, '0', 10);
    expect(play(base, hero('1')).state.players['0'].overcharge).toBe(1);
    const e = nextTurnEnergy(s);
    expect(e.current).toBe(e.total - 1);
    const again = backTo(endTurn(backTo(endTurn(s), '0')), '0').players['0'].energy;
    expect(again.current).toBe(again.total); // only one turn
  });
  it('works on minions and weapons, and stacks', () => {
    expect(play(setup('PRIME_213')).state.players['0'].overcharge).toBe(3);
    expect(play(setup('PRIME_204')).state.players['0'].overcharge).toBe(1);
    const two = setup('PRIME_200', { hand: ['PRIME_213'] });
    const r = play(two).state;
    expect(r.players['0'].overcharge).toBe(2);
  });
  it('cannot take energy below 0', () => {
    const s = play(setup('PRIME_213')).state; // 3 locked on a turn where total is small
    const e = nextTurnEnergy(s);
    expect(e.current).toBe(Math.max(0, e.total - 3));
  });
  it('a card without Overcharge locks nothing', () => {
    expect(play(setup('PRIME_034')).state.players['0'].overcharge).toBeUndefined();
  });
});

describe('the cards', () => {
  it('PRIME_209 hits every enemy minion and the hero for 2', () => {
    const r = play(setup('PRIME_209', { theirs: [[1, 5], [1, 5]], mine: [[1, 5]] })).state;
    expect(stats(r, '1')).toEqual([[1, 3], [1, 3]]);
    expect(r.players['1'].health).toBe(28);
    expect(stats(r, '0')).toEqual([[1, 5]]);
  });
  it('PRIME_208 deals 5 and PRIME_203 deals 3 to the chosen character', () => {
    const s = setup('PRIME_208', { theirs: [[1, 9]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')[0][1]).toBe(4);
    expect(play(setup('PRIME_203'), hero('1')).state.players['1'].health).toBe(27);
    expect(failCode(setup('PRIME_203'))).toBe('ILLEGAL_TARGET');
  });
  it('PRIME_202 deals 2 to two distinct random enemies', () => {
    const r = play(setup('PRIME_202', { theirs: [[1, 9]] })).state;
    expect(r.players['1'].health + stats(r, '1')[0][1]).toBe(30 + 9 - 4);
  });
  it('PRIME_205 grows +1/+1 for each Overcharge card YOU play, nothing else', () => {
    const s = setup('PRIME_203', { mine: [[2, 4, 'PRIME_205']], hand: ['PRIME_034'] });
    const r = play(s, hero('1')).state;
    expect(stats(r, '0')[0]).toEqual([3, 5]);
    const plain = setup('PRIME_034', { mine: [[2, 4, 'PRIME_205']] });
    expect(stats(play(plain).state, '0')[0]).toEqual([2, 4]);
    const theirs = setup('PRIME_203', { theirs: [[2, 4, 'PRIME_205']] });
    expect(stats(play(theirs, hero('1')).state, '1')[0]).toEqual([2, 4]);
  });
});
