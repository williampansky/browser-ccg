import { createMinion } from '../../rules/minion';
import { catalog, endTurn, play, run, setup } from '../../testing/real-cards';
import type { GameState } from '../../state/types';

// PRIME_070: "On Death: Deal 2 damage to all enemies; your minions get Bubble".
// Bubble is only granted when it dies, so the minion itself starts without it.
describe('PRIME_070', () => {
  it('starts with Guard but not Bubble (the Bubble is what it grants)', () => {
    const { keywords } = createMinion(catalog.get('PRIME_070')!, 1, 1, 1);
    expect(keywords.guard).toBe(true);
    expect(keywords.bubble).toBe(false);
  });

  it('dies to a Pit Trap (5 damage on 4 Health) and Bubbles the others', () => {
    const armed: GameState = endTurn(
      play(setup('PRIME_129', { theirs: [[2, 3]] })).state,
    );
    const withWarden: GameState = {
      ...armed,
      players: {
        ...armed.players,
        '1': {
          ...armed.players['1'],
          hand: [{ instanceId: 780, cardId: 'PRIME_070' }],
          energy: { current: 10, total: 10 },
        },
      },
    };
    const result = run(withWarden, { type: 'PlayCard', handIndex: 0 });
    if ('error' in result) throw new Error(result.error);
    const { board } = result.state.players['1'];
    expect(board.map((m) => m.cardId)).not.toContain('PRIME_070');
    expect(board).toHaveLength(1);
    expect(board[0].keywords.bubble).toBe(true);
    expect(result.state.players['0'].health).toBe(
      armed.players['0'].health - 2,
    );
    expect(result.events.map((e) => e.type)).not.toContain('BubblePopped');
  });
});
