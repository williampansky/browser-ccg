import type { Action } from '../../state/types';
import { chooseGreedyActionWith, DEFAULT_WEIGHTS } from '../greedy-bot';
import { createSeededRng } from '../../rng';
import { catalog, setup } from '../../testing/real-cards';

// PRIME_188 is a Combo card; GRUNT is a cheap card that switches Combo on.
// Cards are weighted high so that playing the GRUNT alone is a net loss: only
// the Combo setup bonus makes it worth playing first.
const stingy = { ...DEFAULT_WEIGHTS, card: 6 };

const choose = (combo: number): Action =>
  chooseGreedyActionWith(
    { ...stingy, combo },
    setup('GRUNT', { hand: ['PRIME_188'] }),
    catalog,
    createSeededRng(1),
  );

describe('greedy bot and Combo (PRIME_188)', () => {
  it('plays a cheap card first to switch Combo on', () => {
    expect(choose(DEFAULT_WEIGHTS.combo)).toMatchObject({
      type: 'PlayCard',
      handIndex: 0,
    });
  });

  it('does not bother when Combo is worth nothing to it', () => {
    expect(choose(0)).toEqual({ type: 'EndTurn' });
  });
});
