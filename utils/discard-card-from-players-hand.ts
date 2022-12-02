import { current } from 'immer';
import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID } from '../types';
import { counts } from '../game/state';

/**
 * Discards card from player's hand; also handles `G.Counts`
 */
const discardCardFromPlayersHand = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardUuid: string
): void => {
  if (G.players[player].cards.hand.length >= 1) {
    const hand = G.players[player].cards.hand;
    const cardToDiscard = hand.find(c => c.uuid === cardUuid);
    const cardToDiscardIdx = hand.findIndex(c => c.uuid === cardUuid);
    const newHand = hand.filter(c => c.uuid !== cardUuid);

    if (cardToDiscard && cardToDiscardIdx) {
      G.players[player].cards.discarded.push(cardToDiscard);
      cardToDiscard.booleans.wasDiscarded = true;

      // @ts-ignore
      // ctx.effects.discardCard({
      //   card: current(cardToDiscard),
      //   cardIdx: cardToDiscardIdx,
      //   player
      // });

      G.players[player].cards.hand = newHand;
      counts.decrementHand(G, player);
    }
  }
};

export default discardCardFromPlayersHand;
