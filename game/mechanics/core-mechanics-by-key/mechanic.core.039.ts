import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { counts } from '../../state';
import {
  aiSpreadEventStreamAndOnPlayBoolean,
  getContextualPlayerIds,
  pushEventStream,
} from '../../../utils';

/**
 * add card opponent played to your hand
 */
const core039 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { opponent } = getContextualPlayerIds(player);
    const { numberPrimary } = playedCard;
    const maxHandSize = G.gameConfig.numerics.cardsPerHand;

    for (let index = 0; index < numberPrimary; index++) {
      if (G.playedCards[opponent].length !== 0) {
        const choice = ctx?.random?.Shuffle(G.playedCards[opponent])[0]!;

        if (choice && G.players[player].cards.hand.length < maxHandSize) {
          G.players[player].cards.hand.push(choice);
          counts.incrementHand(G, player);

          playedCard.booleans.onPlayWasTriggered = true;
          pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
        }
      }
    }
  },

  execAi: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card,
    playedCardIdx: number
  ) => {
    const { opponent } = getContextualPlayerIds(player);
    const { numberPrimary } = playedCard;
    const maxHandSize = G.gameConfig.numerics.cardsPerHand;

    for (let index = 0; index < numberPrimary; index++) {
      if (G.playedCards[opponent].length !== 0) {
        const choice = ctx?.random?.Shuffle(G.playedCards[opponent])[0]!;

        if (choice && G.players[player].cards.hand.length < maxHandSize) {
          G.players[player].cards.hand.push(choice);
          counts.incrementHand(G, player);

          aiSpreadEventStreamAndOnPlayBoolean(
            G,
            ctx,
            player,
            zoneNumber,
            playedCard,
            playedCardIdx,
            undefined,
            'onPlayWasTriggered'
          );
        }
      }
    }
  },
};

export default core039;
