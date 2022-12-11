import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import core071 from "../../mechanics/core-mechanics-by-key/mechanic.core.071";

/**
 * 
 */
export default function initGlobalDisableMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_071':
      core071.exec(G, ctx, player, zoneNumber, card);
      break;
  }
};
