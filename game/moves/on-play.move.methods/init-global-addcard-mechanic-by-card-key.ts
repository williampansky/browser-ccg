import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import { core004 } from "../../mechanics";
import { drawCardOnPlay } from "../../mechanics/on-play-mechanics";

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
    // default:
    //   drawCardOnPlay(G, player, card, 'player', 'next');
    //   break;
  }
};
