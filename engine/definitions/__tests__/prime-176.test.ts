import { endTurn, play, setup } from '../../testing/real-cards';

// PRIME_176: "At the end of your turn, heal your most damaged minion 3 and
// your hero 1". Healing never adds Health, and there is nothing to heal when
// nothing is hurt.
describe('PRIME_176', () => {
  it('alone and unhurt at turn end it heals nothing, so its Health stays', () => {
    const played = play(setup('PRIME_176'));
    const [wudu] = played.state.players['0'].board;
    const after = endTurn(played.state);
    const [still] = after.players['0'].board;
    expect(still.health).toBe(wudu.health);
    expect(still.maxHealth).toBe(wudu.maxHealth);
  });

  it('heals the most damaged minion by 3 and no more than its maximum', () => {
    const played = play(setup('PRIME_176', { mine: [[1, 6]] }));
    const hurt = {
      ...played.state,
      players: {
        ...played.state.players,
        '0': {
          ...played.state.players['0'],
          board: played.state.players['0'].board.map((m) =>
            m.cardId === 'GRUNT' ? { ...m, health: 5 } : m,
          ),
        },
      },
    };
    const after = endTurn(hurt);
    const grunt = after.players['0'].board.find((m) => m.cardId === 'GRUNT')!;
    expect(grunt.health).toBe(6);
  });
});
