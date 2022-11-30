import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { actionPoints } from '../../state';

/**
 * +1 current AP for this turn only
 */
export const core034 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const newValue = add(G.actionPoints[player].current, 1);
  G.actionPoints[player].current = newValue;
  card.booleans.onPlayWasTriggered = true;
};
