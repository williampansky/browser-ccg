import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { filterArray, pushEventStream } from '../../../utils';
import { counts } from '../../state';

const discardCardFromHandOnPlay = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardplayed: Card,
  cardToDiscard: Card
) => {
  const hand = G.players[player].cards.hand;

  let possibleTargets: {
    cardData: Card;
    cardIndex: number;
  }[] = [];

  hand.forEach((c, cIdx) => {
    if (c.uuid === cardToDiscard.uuid) {
      possibleTargets.push({
        cardData: c,
        cardIndex: cIdx,
      });
    }
  });

  if (possibleTargets.length !== 0) {
    const choice = possibleTargets[0]!;

    if (choice) {
      cardplayed.booleans.onPlayWasTriggered = true;
      pushEventStream(cardplayed, choice.cardData, 'onPlayWasTriggered');
  
      choice.cardData.booleans.wasDiscarded = true;
  
      G.players[player].cards.discarded.push(choice.cardData);
      counts.decrementHand(G, player);
      counts.incrementDiscarded(G, player);
      filterArray(hand, choice.cardData.uuid, choice.cardIndex);
    }
  }
};

export default discardCardFromHandOnPlay;
