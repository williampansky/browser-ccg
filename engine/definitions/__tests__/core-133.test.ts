import { produce } from 'immer';
import { getCardDef } from '..';
import { mref, realCard, run, setup } from '../../testing/real-cards';

// CORE_133, Demise: deal 2 damage to the enemy's hero.
describe('CORE_133', () => {
  it('is defined', () => {
    expect(getCardDef(realCard('CORE_133'))).toBeDefined();
  });
  it('deals 2 damage to the enemy hero when it dies, and not to its own hero', () => {
    let s = setup('CORE_101', { mine: [[2, 1, 'CORE_133']] });
    const [mine, theirs] = [s.players['0'].health, s.players['1'].health];
    s = produce(s, (g) => void (g.players['0'].energy.current = 10));
    const r = run(s, { type: 'PlayCard', handIndex: 0, target: mref(s, '0', 0) });
    if ('error' in r) throw new Error(r.error);
    expect(r.state.players['0'].board).toHaveLength(0);
    expect(r.state.players['1'].health).toBe(theirs - 2);
    expect(r.state.players['0'].health).toBe(mine);
  });
});
