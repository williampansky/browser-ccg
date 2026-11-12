import { produce } from 'immer';
import { DEFAULT_TURN_SECONDS, turnSeconds } from '../turn-timer';
import { catalog, setup } from '../../testing/real-cards';

describe('turnSeconds', () => {
  it('is 60 seconds by default', () => {
    expect(DEFAULT_TURN_SECONDS).toBe(60);
    expect(turnSeconds(setup('CORE_043'), catalog)).toBe(60);
  });
  it('PRIME_107 Cronus limits the OWNER\'s opponent to 30 seconds, from either side', () => {
    const mine = setup('CORE_043', { mine: [[8, 8, 'PRIME_107']] }); // it is player 0's turn: their own turn stays 60
    expect(turnSeconds(mine, catalog)).toBe(60);
    expect(turnSeconds(produce(mine, (g) => void (g.activePlayer = '1')), catalog)).toBe(30);
    const theirs = setup('CORE_043', { theirs: [[8, 8, 'PRIME_107']] });
    expect(turnSeconds(theirs, catalog)).toBe(30); // player 0 is the opponent of the owner
  });
  it('stops counting when Cronus is Suppressed or gone', () => {
    const s = produce(setup('CORE_043', { theirs: [[8, 8, 'PRIME_107']] }), () => {});
    const silenced = produce(s, (g) => void (g.players['1'].board[0].silenced = true));
    expect(turnSeconds(silenced, catalog)).toBe(60);
    const gone = produce(s, (g) => void (g.players['1'].board = []));
    expect(turnSeconds(gone, catalog)).toBe(60);
  });
});
