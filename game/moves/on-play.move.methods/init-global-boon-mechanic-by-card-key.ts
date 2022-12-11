import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import core042 from "../../mechanics/core-mechanics-by-key/mechanic.core.042";

/**
 * 
 */
export default function initGlobalBoonMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_042':
      core042.exec(G, ctx, player, zoneNumber, card);
      break;
  }
};
