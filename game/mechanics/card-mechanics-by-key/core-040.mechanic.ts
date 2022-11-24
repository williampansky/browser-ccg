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
 * draw the next 4 cards from your deck
 */
export const core040 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const numberPrimary = card?.numberPrimary || 4;
  const { numerics } = gameConfig;
  if (G.players[player].cards.hand.length < numerics.cardsPerHand) {
    drawCardFromPlayersDeck(G, player, numberPrimary);
  }
};
