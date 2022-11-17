import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { drawCardFromPlayersDeck } from '../../../utils';

/**
 * on play: Draw a random card from your deck
 */
export const core003 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const { numerics } = gameConfig;
  if (G.players[player].cards.hand.length < numerics.cardsPerHand) {
    drawCardFromPlayersDeck(G, player, 1);
  }
};
