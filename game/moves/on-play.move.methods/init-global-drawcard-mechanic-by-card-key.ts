import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import { drawCardOnPlay } from "../../mechanics/on-play-mechanics";

/**
 * 
 */
export default function initGlobalDrawCardMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_003':
      drawCardOnPlay(G, player, card, card.mechanicsSide, 'random');
      break;
  }
};
