import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import { core060 } from "../../mechanics";
import { debuffPowerOfCardsInZone } from "../../mechanics/on-play-mechanics";

/**
 * 
 */
export default function initGlobalDamageMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_060':
      core060.exec(G, ctx, player, zoneNumber, card);
  }
};
