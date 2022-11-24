import type { Ctx } from 'boardgame.io';
import { add } from 'mathjs';
import type {
  Card,
  CardBase,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { actionPoints } from '../../state';

/**
 * get 1 additional energy slot
 */
export const core037 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const numberPrimary = card?.numberPrimary || 1;
  const currentTotal = G.actionPoints[player].total;
  actionPoints.setTotal(G, player, add(currentTotal, numberPrimary))
};
