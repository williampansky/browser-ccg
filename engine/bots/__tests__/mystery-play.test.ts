import { chooseGreedyAction } from '../greedy-bot';
import { isBadPlay } from '../common';
import { createSeededRng } from '../../rng';
import { catalog, play, setup } from '../../testing/real-cards';

// The greedy bot used to treat a face-down Mystery as "a card that changes
// nothing" and never played one.

describe('greedy bot and Mysteries / Overcharge', () => {
  it('plays a Mystery it can afford instead of passing', () => {
    const s = setup('PRIME_143');
    const a = chooseGreedyAction(s, catalog, createSeededRng(1));
    expect(a).toEqual({ type: 'PlayCard', handIndex: 0 });
  });
  it('with a Mystery already face down it ends its turn rather than offering a second one', () => {
    const placed = play(setup('PRIME_143', { hand: ['PRIME_127'] })).state;
    expect(chooseGreedyAction(placed, catalog, createSeededRng(1))).toEqual({
      type: 'EndTurn',
    });
  });
});

describe('greedy bot and silence', () => {
  it('never silences its own minion just to use a spell (CORE_085 on board, PRIME_171 in hand)', () => {
    const s = setup('PRIME_171', { mine: [[2, 2, 'CORE_085']] });
    const target = {
      kind: 'minion' as const,
      instanceId: s.players['0'].board[0].instanceId,
    };
    expect(
      isBadPlay(s, { type: 'PlayCard', handIndex: 0, target }, catalog),
    ).toBe(true);
  });
  it('still silences an enemy minion when that is the play', () => {
    const s = setup('PRIME_171', { theirs: [[2, 2, 'CORE_085']] });
    const target = {
      kind: 'minion' as const,
      instanceId: s.players['1'].board[0].instanceId,
    };
    expect(
      isBadPlay(s, { type: 'PlayCard', handIndex: 0, target }, catalog),
    ).toBe(false);
  });
});
