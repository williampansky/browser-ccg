import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import { core005 } from "../../mechanics";

/**
 * 
 */
export default function initGlobalBuffMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_005':
      core005.exec(G, ctx, player, zoneNumber, card);
      break;
  }
};
