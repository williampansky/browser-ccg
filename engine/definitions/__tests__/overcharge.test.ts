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
    const base = setup('PRIME_203', { theirs: [[1, 9]] });
    const s = setEnergy(play(base, mref(base, '1', 0)).state, '0', 10);
    expect(play(base, mref(base, '1', 0)).state.players['0'].overcharge).toBe(1);
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
    expect(r.players['0'].overcharge).toBe(1);
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
