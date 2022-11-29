import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { counts } from '../../state';

/**
 * add 2 cards opponent played to your deck
 */
export const core019 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  opponent: PlayerID,
) => {
  const { numberRNG } = card;
  
  for (let index = 0; index < numberRNG; index++) {
    if (G.playedCards[opponent].length !== 0) {
      const choice = ctx?.random?.Shuffle(G.playedCards[opponent])[0]!;
      G.players[player].cards.deck.push(choice);
      counts.incrementDeck(G, player);
    }
  }
};
