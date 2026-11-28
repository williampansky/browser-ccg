import { minion, play, setup } from '../../testing/real-cards';

const BASE_ATTACK = 3;
const BASE_HEALTH = 3;

describe('PRIME_222', () => {
  it('destroys the friendly minion beside it and gains its stats', () => {
    const start = setup('PRIME_222', { mine: [[2, 4]] });
    const { state } = play(start);
    const { board } = state.players['0'];

    expect(board).toHaveLength(1);
    expect(minion(state, '0', 0).attack).toBe(BASE_ATTACK + 2);
    expect(minion(state, '0', 0).health).toBe(BASE_HEALTH + 4);
  });

  it('does not touch enemy minions', () => {
    const start = setup('PRIME_222', { theirs: [[2, 4]] });
    const { state } = play(start);

    expect(state.players['1'].board).toHaveLength(1);
    expect(minion(state, '0', 0).attack).toBe(BASE_ATTACK);
  });

  it('is plain 3/3 with no neighbours', () => {
    const { state } = play(setup('PRIME_222'));

    expect(minion(state, '0', 0).health).toBe(BASE_HEALTH);
  });
});
