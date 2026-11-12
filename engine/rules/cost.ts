import type { Card, CardCatalog } from '../cards/types';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';
import type { GameState, PlayerId } from '../state/types';

/**
 * What `player` pays to play `card` right now: the printed cost, changed by the card's own rule (`ownCost`) and by
 * `costMods` on that player's minions. All changes add up; a net reduction stops at the highest floor among the
 * reducing rules, but never raises a card above its printed cost (so "not less than 1" leaves a 0-cost card at 0).
 * Never below 0.
 */
export const effectiveCost = (
  state: GameState,
  player: PlayerId,
  card: Card,
  catalog: CardCatalog,
  defs: DefLookup = getCardDef
): number => {
  let delta = defs(card)?.ownCost?.({ state, owner: player }) ?? 0;
  let floor = 0;
  for (const m of state.players[player].board) {
    const source = catalog.get(m.cardId);
    for (const mod of (source && defs(source)?.costMods) ?? []) {
      if (!mod.affects(card)) continue;
      delta += mod.delta;
      if (mod.delta < 0) floor = Math.max(floor, mod.floor ?? 0);
    }
  }
  if (delta === 0) return card.cost;
  return Math.max(0, delta < 0 ? Math.max(card.cost + delta, Math.min(card.cost, floor)) : card.cost + delta);
};
