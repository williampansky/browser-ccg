import type { Ctx } from "boardgame.io";
import type { GameState } from "../types";
import { initEventMechanics } from "../game/mechanics";
import cardHasEvent from "./card-has-event";
import getContextualPlayerIds from "./get-contextual-player-ids";

/**
 * Note that this function contains a `G.zones.forEach` loop—and its 
 * child method `initEventMechanics()`, can also *potentially* contain
 * an additional `G.zones.forEach` loop. Code accordingly ^_^
 * 
 * ```ts
 * // init-active-event-listeners.ts
 * G.zones.forEach((z, zI) => {
 *  z.sides[currentPlayer].forEach((c, cI) => {
 *    // init-event-mechanics.ts
 *    G.zones.forEach((z, zI) => {
 *      z.sides[currentPlayer].forEach((c, cI) => {
 *        // executed mechanic code
 *      });
 *    });
 *  });
 * });
 * ```
 */
const initActivateEventListeners = (G: GameState, ctx: Ctx) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);
  
  G.zones.forEach((z, zI) => {
    z.sides[currentPlayer].forEach((c, cI) => {
      if (cardHasEvent(c)) {
        initEventMechanics(
          G,
          ctx,
          z,
          zI,
          c,
          cI,
          currentPlayer,
        );
      }
    });

    z.sides[opponent].forEach((c, cI) => {
      if (cardHasEvent(c)) {
        initEventMechanics(
          G,
          ctx,
          z,
          zI,
          c,
          cI,
          opponent,
        );
      }
    });
  });
};

export default initActivateEventListeners