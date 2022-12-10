import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { createCardObject, pushEventStream } from '../../../utils';
import { counts } from '../../state';
import setsCore from '../../data/setsCore.json';

/**
 * on play: Add a random card to your hand
 */
const core004 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numerics } = G.gameConfig;

    if (G.players[player].cards.hand.length < numerics.cardsPerHand) {
      const randomCardBase = ctx.random!.Shuffle(setsCore)[0];
      const randomCard = createCardObject(randomCardBase!);

      G.players[player].cards.hand.push(randomCard);
      counts.incrementHand(G, player);

      playedCard.booleans.onPlayWasTriggered = true;
      pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
    }
  },
};

export default core004;
