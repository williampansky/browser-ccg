import { EffectsCtxMixin } from 'bgio-effects';
import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { discardCardFromPlayersHand } from '../../../utils';
import { current } from 'immer';
import { discardCardFromHandOnPlay } from '../on-play-mechanics';

/**
 * discard most expensive costing card from hand
 */
export const core133 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const sortedHandByCost = G.players[player].cards.hand
    .map((c) => c)
    .sort((a: Card, b: Card) => b.currentCost - a.currentCost);

  const choice = sortedHandByCost[0];
  if (choice) discardCardFromHandOnPlay(G, ctx, player, card, choice);
};
