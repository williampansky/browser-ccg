import type { CardCatalog } from '../cards/types';
import type { DefLookup } from '../definitions/define-card';
import type { Rng } from '../rng';
import { legalActions } from '../rules/legal-actions';
import { isBadPlay } from './common';
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
  // Skip plays a person would not make: hurting its own side, or a spell that changes nothing.
  // A temporary weapon is lost at end of turn, so use it.
  if (state.players[state.activePlayer].weapon?.temporary) {
    const swings = actions.filter((a) => a.type === 'WeaponAttack');
    if (swings.length > 0) return rng.pick(swings);
  }
  const moves = actions.filter((a) => a.type !== 'EndTurn' && !isBadPlay(state, a, catalog, defs));
  if (moves.length > 0 && rng.int(8) < ACT_CHANCE) return rng.pick(moves);
  return { type: 'EndTurn' };
};
