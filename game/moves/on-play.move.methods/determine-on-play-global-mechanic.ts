import type { Ctx } from "boardgame.io";
import { Mechanics } from "../../../enums";
import type { Card, GameState, PlayerID } from "../../../types";
import initGlobalAddCardMechanicByCardKey from "./init-global-addcard-mechanic-by-card-key";
import initGlobalDamageMechanicByCardKey from "./init-global-damage-mechanic-by-card-key";
import initGlobalDebuffMechanicByCardKey from "./init-global-debuff-mechanic-by-card-key";
import initGlobalDestroyMechanicByCardKey from "./init-global-destroy-mechanic-by-card-key";
import initGlobalDrawCardMechanicByCardKey from "./init-global-drawcard-mechanic-by-card-key";

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
      initGlobalAddCardMechanicByCardKey(G, ctx, zoneNumber, card, player);
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
      initGlobalDamageMechanicByCardKey(G, ctx, zoneNumber, card, player);
      break;
    case Mechanics.Debuff:
      initGlobalDebuffMechanicByCardKey(G, ctx, zoneNumber, card, player);
      break;
    case Mechanics.Destroy:
      initGlobalDestroyMechanicByCardKey(G, ctx, zoneNumber, card, player);
      break;
    case Mechanics.Disable:
      console.log('@todo init global Disable');
      break;
    case Mechanics.DrawCard:
      initGlobalDrawCardMechanicByCardKey(G, ctx, zoneNumber, card, player);
      break;
    case Mechanics.DiscardCard:
      console.log('@todo init global DiscardCard');
      break;
    case Mechanics.Heal:
      console.log('@todo init global Heal');
      break;
    case Mechanics.SetCost:
      console.log('@todo init global SetCost');
      break;
    case Mechanics.SetValue:
      console.log('@todo init global SetValue');
      break;
    case Mechanics.SpellDamage:
      console.log('@todo init global SpellDamage');
      break;
    case Mechanics.Silence:
      console.log('@todo init global Silence');
      break;
    case Mechanics.Summon:
      console.log('@todo init global Summon');
      break;
    case Mechanics.Transform:
      console.log('@todo init global Transform');
      break;
    default:
      break;
  }
};
