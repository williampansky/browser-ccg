import { play, run, setup } from '../../testing/real-cards';

// PRIME_102: "At the end of your turn, deal 2 damage to ALL other
// characters". The trigger event names the minion it came from, so the board
// can show the damage as coming from it.
describe('PRIME_102', () => {
  it('fires its end-of-turn trigger naming its own instance', () => {
    const played = play(setup('PRIME_102', { theirs: [[1, 5]] }));
    const [jotunn] = played.state.players['0'].board;
    const result = run(played.state, { type: 'EndTurn' });
    if ('error' in result) throw new Error(result.error);
    const fired = result.events.find((e) => e.type === 'TriggerFired');
    expect(fired).toMatchObject({
      type: 'TriggerFired',
      cardId: 'PRIME_102',
      instanceId: jotunn.instanceId,
    });
  });
});
