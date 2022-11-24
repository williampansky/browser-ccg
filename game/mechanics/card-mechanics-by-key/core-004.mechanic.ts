import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { createCardObject } from '../../../utils';
import { counts } from '../../state';
import setsCore from '../../data/setsCore.json';

/**
 * on play: Add a random card to your hand
 */
export const core004 = (
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
    const randomCardBase = ctx.random!.Shuffle(setsCore)[0];
    const randomCard = createCardObject(randomCardBase!);
    G.players[player].cards.hand.push(randomCard);
    counts.incrementHand(G, player);
  }
};
