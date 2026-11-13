import { createSeededRng } from '../../rng';
import type { GameState } from '../../state/types';
import { catalog, endTurn, play, setup } from '../../testing/real-cards';
import { chooseGreedyAction } from '../greedy-bot';

/** Player 0 sets PRIME_148, then it is Player 1's turn with a ready 5/5 and nothing to play (so the only question is the attack). */
const armed = (): GameState => {
  const s = endTurn(play(setup('PRIME_148', { theirs: [[5, 5]], heroHp: { '0': 20 } })).state);
  return { ...s, players: { ...s.players, '1': { ...s.players['1'], hand: [] } } };
};

// The bot must not see through the human's face-down Mystery: it cannot know what it will do, so a Mystery must neither
// scare it off attacking nor lure it into attacking.

describe('greedy bot and a face-down Mystery', () => {
  it('still attacks the hero into a face-down PRIME_148 (it cannot see the damage coming)', () => {
    const s = armed();
    expect(s.players['0'].mystery?.cardId).toBe('PRIME_148');
    const a = chooseGreedyAction(s, catalog, createSeededRng(1));
    expect(a.type).toBe('Attack');
  });
  it('makes the same choice with and without the Mystery', () => {
    const withIt = armed();
    const without = { ...withIt, players: { ...withIt.players, '0': { ...withIt.players['0'], mystery: null } } };
    expect(chooseGreedyAction(withIt, catalog, createSeededRng(1))).toEqual(chooseGreedyAction(without, catalog, createSeededRng(1)));
  });
});
