import { getCardDef } from '..';
import { mref, play, realCard, setup, stats } from '../../testing/real-cards';

// CORE_157: No Attack, Guard, On Death: deal 2 damage to everyone.
describe('CORE_157', () => {
  it('is defined', () => {
    expect(getCardDef(realCard('CORE_157'))).toBeDefined();
  });
  it('has No Attack and Guard on the board, and playing it hurts nobody', () => {
    const s = setup('CORE_157', { mine: [[2, 5]], theirs: [[3, 3]] });
    const r = play(s).state;
    const hut = r.players['0'].board[1];
    expect(hut.keywords).toMatchObject({ noAttack: true, guard: true });
    expect([r.players['0'].health, r.players['1'].health]).toEqual([
      s.players['0'].health,
      s.players['1'].health,
    ]);
    expect(stats(r, '1')).toEqual([[3, 3]]);
  });
  it('when it dies it deals 2 to both heroes and every other minion, on both sides', () => {
    // CORE_101 (destroy a minion) used on the Hut itself
    const s = setup('CORE_101', {
      mine: [
        [4, 4, 'CORE_157'],
        [2, 5],
      ],
      theirs: [
        [3, 3],
        [1, 2],
      ],
    });
    const r = play(s, mref(s, '0', 0)).state;
    expect(stats(r, '0')).toEqual([[2, 3]]);
    expect(stats(r, '1')).toEqual([[3, 1]]); // the 1/2 died to it
    expect([r.players['0'].health, r.players['1'].health]).toEqual([
      s.players['0'].health - 2,
      s.players['1'].health - 2,
    ]);
  });
});
