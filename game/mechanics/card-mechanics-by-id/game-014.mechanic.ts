import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

/**
 * Increase the cost of a card in your opponent's hand by 1
 */
export const game014 = (
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
  if (G.players[opponent].cards.hand.length >= 1) {
    const rCard = ctx.random?.Shuffle(G.players[opponent].cards.hand)[0];
    G.players[opponent].cards.hand.forEach((c) => {
      if (c.uuid === rCard!.uuid) {
        c.currentCost = add(c.currentCost, 1);
      }
    });
  }
};
