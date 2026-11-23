import { getCardDef } from '..';
import { backTo, endTurn, play, realCard, setup } from '../../testing/real-cards';

// CORE_134: at the start of your next turn, destroy every single minion (both boards, itself included).
describe('CORE_134', () => {
  it('is defined', () => {
    expect(getCardDef(realCard('CORE_134'))).toBeDefined();
  });
  it('leaves the board alone until the owner\'s next turn starts, then destroys every minion on both sides', () => {
    let s = play(setup('CORE_134', { mine: [[2, 2]], theirs: [[3, 3], [1, 1]] })).state;
    expect(s.players['0'].board).toHaveLength(2); // the Well and the grunt
    s = endTurn(s); // the opponent's turn starts: nothing happens
    expect(s.players['0'].board).toHaveLength(2);
    expect(s.players['1'].board).toHaveLength(2);
    s = backTo(s, '0'); // the owner's next turn starts
    expect(s.players['0'].board).toHaveLength(0);
    expect(s.players['1'].board).toHaveLength(0);
  });
});
