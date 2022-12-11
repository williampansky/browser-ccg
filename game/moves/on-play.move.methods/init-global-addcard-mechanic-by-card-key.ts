import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import { core004, core011, core019 } from "../../mechanics";

/**
 * 
 */
export default function initGlobalAddCardMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_004':
      core004.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_011':
      core011.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_019':
      core019.exec(G, ctx, player, zoneNumber, card);
      break;
  }
};
