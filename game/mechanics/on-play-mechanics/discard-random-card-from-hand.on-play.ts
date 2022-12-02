import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { cardIsNotSelf, filterArray } from '../../../utils';
import { counts } from '../../state';

const discardRandomCardFromHandOnPlay = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardplayed: Card
) => {
  const { numberPrimary } = cardplayed;
  const hand = G.players[player].cards.hand;

  let possibleTargets: {
    cardData: Card;
    cardIndex: number;
  }[] = [];

  hand.forEach((c, cIdx) => {
    if (cardIsNotSelf(c, cardplayed)) {
      possibleTargets.push({
        cardData: c,
        cardIndex: cIdx,
      });
    }
  });

  if (possibleTargets.length !== 0) {
    for (let index = 0; index < numberPrimary; index++) {
      const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;
      cardplayed.booleans.onPlayWasTriggered = true;
      choice.cardData.booleans.wasDiscarded = true;
      G.players[player].cards.discarded.push(choice.cardData);
      counts.decrementHand(G, player);
      counts.incrementDiscarded(G, player);
      filterArray(hand, choice.cardData.uuid, choice.cardIndex);
    }
  }
};

export default discardRandomCardFromHandOnPlay;
