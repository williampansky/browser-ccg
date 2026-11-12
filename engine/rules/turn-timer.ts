import type { CardCatalog } from '../cards/types';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';
import type { GameState } from '../state/types';

/** How long a turn lasts by default, in seconds. */
export const DEFAULT_TURN_SECONDS = 60;

/**
 * The time limit for the current turn: 60 seconds, or less while a minion shortens it (Cronus: the owner's opponent gets 30). The shortest
 * limit wins. A Suppressed minion no longer counts.
 *
 * The engine has no clock: it only says how long a turn may last. Whoever runs the game enforces it by ending the turn when the
 * time is up (`{ type: 'EndTurn' }`). A browser tab cannot do this fairly (a player controls their own page), so for
 * networked play the game server must keep the clock and call this same function; the `/play` page is only a local stand-in.
 */
export const turnSeconds = (state: GameState, catalog: CardCatalog, defs: DefLookup = getCardDef): number => {
  let seconds = DEFAULT_TURN_SECONDS;
  for (const p of ['0', '1'] as const) {
    for (const m of state.players[p].board) {
      const card = m.silenced ? undefined : catalog.get(m.cardId);
      const def = card && defs(card);
      if (def?.turnSeconds !== undefined) seconds = Math.min(seconds, def.turnSeconds);
      if (def?.opponentTurnSeconds !== undefined && state.activePlayer !== p) seconds = Math.min(seconds, def.opponentTurnSeconds);
    }
  }
  return seconds;
};
