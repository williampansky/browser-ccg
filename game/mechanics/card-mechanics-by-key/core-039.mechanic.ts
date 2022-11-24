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
 * add a card your opponent played to your hand
 */
export const core039 = (
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
  const { numerics } = gameConfig;

  // make sure your hand can hold a card draw
  if (G.players[player].cards.hand.length < numerics.cardsPerHand) {

    // make sure ur opponent has played at least 1 card
    if (G.playedCards[opponent].length !== 0) {
      const choice = ctx?.random?.Shuffle(G.playedCards[opponent])[0]!;
      G.players[player].cards.hand.push(choice);
      counts.incrementHand(G, player);
    }
  }
};
