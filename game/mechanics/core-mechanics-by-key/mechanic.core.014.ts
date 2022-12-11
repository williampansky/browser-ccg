import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
} from '../../../utils';
import { gte } from 'lodash';

/**
 * Increase the cost of a card in your opponent's hand by 1
 */
const core014 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { opponent } = getContextualPlayerIds(player);
    const opponentHasCards = gte(G.players[opponent].cards.hand.length, 1);

    if (opponentHasCards) {
      const rngCard = ctx.random?.Shuffle(G.players[opponent].cards.hand)[0];

      if (rngCard)
        G.players[opponent].cards.hand.forEach((c) => {
          if (cardUuidMatch(c, rngCard)) {
            c.currentCost = add(c.currentCost, 1);
            c.booleans.hasCostIncreased = true;

            playedCard.booleans.onPlayWasTriggered = true;
            pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
          }
        });
    }
  },
};

export default core014;
