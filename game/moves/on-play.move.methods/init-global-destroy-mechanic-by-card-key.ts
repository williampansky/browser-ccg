import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import { core041 } from "../../mechanics";

/**
 * 
 */
export default function initGlobalDestroyMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_041':
      core041.exec(G, ctx, player, zoneNumber, card);
      break;
  }
};
