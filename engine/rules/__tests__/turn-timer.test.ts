import { produce } from 'immer';
import { DEFAULT_TURN_SECONDS, turnSeconds } from '../turn-timer';
import { catalog, setup } from '../../testing/real-cards';

describe('turnSeconds', () => {
  it('is 60 seconds by default', () => {
    expect(DEFAULT_TURN_SECONDS).toBe(60);
    expect(turnSeconds(setup('CORE_043'), catalog)).toBe(60);
  });
  it('PRIME_107 Cronus shortens turns to 15 seconds from either board', () => {
    expect(turnSeconds(setup('CORE_043', { mine: [[8, 8, 'PRIME_107']] }), catalog)).toBe(15);
    expect(turnSeconds(setup('CORE_043', { theirs: [[8, 8, 'PRIME_107']] }), catalog)).toBe(15);
  });
  it('stops counting when Cronus is Suppressed or gone', () => {
    const s = setup('CORE_043', { mine: [[8, 8, 'PRIME_107']] });
    const silenced = produce(s, (g) => void (g.players['0'].board[0].silenced = true));
    expect(turnSeconds(silenced, catalog)).toBe(60);
    const gone = produce(s, (g) => void (g.players['0'].board = []));
    expect(turnSeconds(gone, catalog)).toBe(60);
  });
});
