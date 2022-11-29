import type { Ctx } from 'boardgame.io';
import { subtract } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { pushHealthStreamAndSetDisplay } from '../../../utils';

/**
 * disable opponent's zone for 1 turn
 */
export const core071 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  opponent: PlayerID
) => {
  const { numberPrimary } = card;
  card.booleans.onPlayWasTriggered = true;
  G.zones[zoneIdx].disabled[opponent] = true;
  G.zones[zoneIdx].disabledForXTurns[opponent] = numberPrimary;
};
