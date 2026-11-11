import type { CardCatalog } from '../cards/types';
import type { DefLookup } from '../definitions/define-card';
import type { Rng } from '../rng';
import { applyAction } from '../rules/apply-action';
import { legalActions } from '../rules/legal-actions';
import { createSeededRng } from '../rng';
import type { Action, GameState, PlayerId, TargetRef } from '../state/types';

/** Chance (out of 8) that the bot acts rather than ending its turn when it still has a move. */
const ACT_CHANCE = 7;

const healthOf = (state: GameState, t: TargetRef): number | undefined => {
  if (t.kind === 'hero') return state.players[t.player].health + state.players[t.player].armor;
  for (const p of ['0', '1'] as PlayerId[]) {
    const m = state.players[p].board.find((x) => x.instanceId === t.instanceId);
    if (m) return m.health;
  }
  return undefined; // gone
};
const isFriendly = (state: GameState, t: TargetRef): boolean =>
  t.kind === 'hero' ? t.player === state.activePlayer : state.players[state.activePlayer].board.some((m) => m.instanceId === t.instanceId);

/**
 * True when a targeted card would hurt the bot's own character (a damage spell aimed at its own minion
 * or hero). It plays the action on a copy with a throwaway rng and compares the target's health.
 */
const hurtsOwn = (state: GameState, a: Action, catalog: CardCatalog, defs?: DefLookup): boolean => {
  if (a.type !== 'PlayCard' || !a.target || !isFriendly(state, a.target)) return false;
  const result = applyAction(state, a, { rng: createSeededRng(1), catalog, defs });
  if ('error' in result) return false;
  const before = healthOf(state, a.target) ?? 0;
  const after = healthOf(result.state, a.target);
  return after === undefined || after < before;
};

/**
 * A deliberately simple opponent: picks a random legal action for the active player, leaning toward
 * doing something instead of passing. It only ever picks from `legalActions`, so it cannot cheat or
 * make an illegal move. Call it repeatedly until it returns `EndTurn`.
 */
export const chooseRandomAction = (state: GameState, catalog: CardCatalog, rng: Rng, defs?: DefLookup): Action => {
  const actions = legalActions(state, state.activePlayer, catalog, defs);
  // Never aim a card at its own side when that would hurt it (a real player would not).
  const moves = actions.filter((a) => a.type !== 'EndTurn' && !hurtsOwn(state, a, catalog, defs));
  if (moves.length > 0 && rng.int(8) < ACT_CHANCE) return rng.pick(moves);
  return { type: 'EndTurn' };
};
