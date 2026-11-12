import { chooseGreedyAction } from '../greedy-bot';
import { createSeededRng } from '../../rng';
import { catalog, play, setup } from '../../testing/real-cards';

// The greedy bot used to treat a face-down Mystery as "a card that changes nothing" and never played one.

describe('greedy bot and Mysteries / Overcharge', () => {
  it('plays a Mystery it can afford instead of passing', () => {
    const s = setup('PRIME_143');
    const a = chooseGreedyAction(s, catalog, createSeededRng(1));
    expect(a).toEqual({ type: 'PlayCard', handIndex: 0 });
  });
  it('with a Mystery already face down it ends its turn rather than offering a second one', () => {
    const placed = play(setup('PRIME_143', { hand: ['PRIME_127'] })).state;
    expect(chooseGreedyAction(placed, catalog, createSeededRng(1))).toEqual({ type: 'EndTurn' });
  });
});
