// import { RACE } from '@ccg/enums';
// import drawCard from './draw-card';
import actionPoints from '../state/action-points';
import deselectCard from './deselect-card';
import copyCardToPlayedCards from '../utils/copy-card-to-played-cards';
import counts from '../state/counts';
import handleCardPlayability from '../utils/handle-card-playability';
import removeCardFromHand from '../utils/remove-card-from-hand';
import selectedCardIndex from '../state/selected-card-index';
import selectedCardInteractionContext from '../state/selected-card-interaction-context';
import selectedCardObject from '../state/selected-card-object';
import playSpellByCardId from '../spells';

const playGlobalSpellCard = (G, ctx, index, uuid, cardId, cardCost) => {
  const { serverConfig } = G;
  const { currentPlayer } = ctx;

  if (serverConfig.debugData.enableCost)
    actionPoints.subtract(G, currentPlayer, cardCost);

  playSpellByCardId(G, ctx, cardId, index);
  // logMessage(G, ctx, 'playGlobalSpellCard');
  deselectCard(G, ctx);

  if (serverConfig.debugData.enableRemoveCardFromHand) {
    // move to your playerCards array
    copyCardToPlayedCards(G, currentPlayer, cardId);
    // and then remove card from your hand
    removeCardFromHand(G, currentPlayer, uuid);
    // then deincrement your hand count
    counts.deincrementHand(G, currentPlayer);
  }

  // reset states
  selectedCardIndex.reset(G, currentPlayer);
  selectedCardObject.reset(G, currentPlayer);
  selectedCardInteractionContext.reset(G, currentPlayer);

  // loop thru your board and check for
  // event listener mechanic minions
  G.boards[currentPlayer].forEach((slot, i) => {
    const {
      minionData: { id }
    } = slot;

    switch (id) {
      default:
        break;
    }
  });

  // loop thru your hand and recalculate actionPoints/costs
  handleCardPlayability(G, currentPlayer);
};

export default playGlobalSpellCard;
