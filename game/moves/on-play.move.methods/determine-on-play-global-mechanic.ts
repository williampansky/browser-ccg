import type { Ctx } from "boardgame.io";
import { Mechanics } from "../../../enums";
import type { Card, GameState, PlayerID } from "../../../types";
import initGlobalDebuffMechanicByCardKey from "./init-global-debuff-mechanic-by-card-key";

/**
 * Determines the context of the `card` param's mechanic context
 * and continues path based on that determination.
 */
 export default function determineOnPlayGlobalMechanic (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.mechanicsContext) {
    case Mechanics.AddCard:
      console.log('@todo init global AddCard');
      break;
    case Mechanics.Boon:
      console.log('@todo init global Boon');
      break;
    case Mechanics.Buff:
      console.log('@todo init global Buff');
      break;
    case Mechanics.Bulwark:
      console.log('@todo init global Bulwark');
      break;
    case Mechanics.Damage:
      console.log('@todo init global Damage');
      break;
    case Mechanics.Debuff:
      initGlobalDebuffMechanicByCardKey(G, ctx, zoneNumber, card, player);
      break;
    case Mechanics.Destroy:
      console.log('@todo init global Destroy');
      break;
    case Mechanics.Disable:
      console.log('@todo init global Disable');
      break;
    case Mechanics.DiscardCard:
      console.log('@todo init global DiscardCard');
      break;
    case Mechanics.Heal:
      console.log('@todo init global Heal');
      break;
    case Mechanics.Summon:
      console.log('@todo init global Summon');
      break;
    default:
      break;
  }
};
