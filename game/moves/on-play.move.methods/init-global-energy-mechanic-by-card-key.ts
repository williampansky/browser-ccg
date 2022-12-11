import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../types";
import { core034 } from "../../mechanics/core-mechanics-by-key/mechanic.core.034";

/**
 * 
 */
export default function initGlobalEnergyMechanicByCardKey (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_034':
      core034.exec(G, ctx, player, zoneNumber, card);
  }
};
