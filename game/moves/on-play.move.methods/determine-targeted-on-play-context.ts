import type { Ctx } from 'boardgame.io';
import type { Card, GameState } from '../../../types';
import { Mechanics } from '../../../enums';
import {
  initTargetedOnPlayBuffStage,
  initTargetedOnPlayDamageStage,
  initTargetedOnPlayDestroyStage,
  initTargetedOnPlayHealStage,
} from './init-targeted-on-play-stage';

/**
 *
 */
export default function determineTargetedOnPlayContext(
  G: GameState,
  ctx: Ctx,
  card: Card
) {
  // prettier-ignore
  switch (card.mechanicsContext) {
    case Mechanics.Buff:    return initTargetedOnPlayBuffStage(G, ctx, card);
    case Mechanics.Damage:  return initTargetedOnPlayDamageStage(G, ctx, card);
    case Mechanics.Destroy: return initTargetedOnPlayDestroyStage(G, ctx, card);
    case Mechanics.Heal:    return initTargetedOnPlayHealStage(G, ctx, card);
  }
}
