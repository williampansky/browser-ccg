import { chooseGreedyAction } from '../greedy-bot';
import { createSeededRng } from '../../rng';
import { catalog, setup } from '../../testing/real-cards';

// CORE_134 wipes every minion at the start of its owner's next turn, so the bot
// should value it by what it removes, not by its own 0/7 body.
const choose = (state: ReturnType<typeof setup>) =>
  chooseGreedyAction(state, catalog, createSeededRng(1));

const playsTheWell = (action: ReturnType<typeof choose>) =>
  action.type === 'PlayCard' && action.handIndex === 0;

describe('greedy bot and CORE_134', () => {
  it('does not play it onto an empty board: nothing to clear', () => {
    expect(choose(setup('CORE_134'))).toEqual({ type: 'EndTurn' });
  });

  it('does not play it when its own board is the stronger one', () => {
    const state = setup('CORE_134', {
      mine: [
        [5, 5],
        [4, 4],
      ],
      theirs: [[1, 1]],
    });
    expect(playsTheWell(choose(state))).toBe(false);
  });

  it('plays it when the enemy board is far stronger than its own', () => {
    const state = setup('CORE_134', {
      mine: [[1, 1]],
      theirs: [
        [5, 5],
        [5, 5],
        [4, 4],
      ],
    });
    expect(playsTheWell(choose(state))).toBe(true);
  });
});
