import type { CardCatalog } from '../cards/types';
import type { DefLookup } from '../definitions/define-card';
import type { Rng } from '../rng';
import { legalActions } from '../rules/legal-actions';
import type { Action, GameState } from '../state/types';

/** Chance (out of 8) that the bot acts rather than ending its turn when it still has a move. */
const ACT_CHANCE = 7;

/**
 * A deliberately simple opponent: picks a random legal action for the active player, leaning toward
 * doing something instead of passing. It only ever picks from `legalActions`, so it cannot cheat or
 * make an illegal move. Call it repeatedly until it returns `EndTurn`.
 */
export const chooseRandomAction = (state: GameState, catalog: CardCatalog, rng: Rng, defs?: DefLookup): Action => {
  const actions = legalActions(state, state.activePlayer, catalog, defs);
  const moves = actions.filter((a) => a.type !== 'EndTurn');
  if (moves.length > 0 && rng.int(8) < ACT_CHANCE) return rng.pick(moves);
  return { type: 'EndTurn' };
};
