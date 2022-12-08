import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import { debuffPowerOfCardsInZone } from "../../mechanics/on-play-mechanics";

/**
 * 
 */
export default function initGlobalDebuffMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    default:
      debuffPowerOfCardsInZone(G, ctx, zoneNumber, card, player);
      break;
  }
};
