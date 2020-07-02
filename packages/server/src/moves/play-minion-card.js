import boards from '../state/boards';
import selectedCardInteractionContext from '../state/selected-card-interaction-context';
import selectedCardIndex from '../state/selected-card-index';
import selectedCardObject from '../state/selected-card-object';
import createBoardSlotObject from '../creators/create-board-slot-object';
import initCardMechanics from '../mechanics/init-mechanics';
import actionPoints from '../state/action-points';
import copyCardToPlayedCards from '../utils/copy-card-to-played-cards';
import removeCardFromHand from '../utils/remove-card-from-hand';

/**
 * @param {object} G
 * @param {object} ctx
 * @param {object} cardObject
 * @param {number} index
 */
const playMinionCard = (G, ctx, index) => {
  const { selectedCardObject: selectedCardObj, serverConfig } = G;
  const { currentPlayer } = ctx;
  const { cost, id, race, uuid } = selectedCardObj[currentPlayer];
  const slotObject = createBoardSlotObject(id);

  // play card into board
  boards.placeCardOnBoard(G, currentPlayer, slotObject, index);

  // subtract the card's cost from player's current actionPoints count
  if (serverConfig.debugData.enableCost)
    actionPoints.subtract(G, currentPlayer, cost);

  // check and init and mechanics
  if (serverConfig.debugData.enableMechanics)
    initCardMechanics(G, ctx, slotObject, index);

  // move to your playerCards array
  copyCardToPlayedCards(G, currentPlayer, id);

  // and then remove card from your hand
  if (serverConfig.debugData.enableRemoveCardFromHand)
    removeCardFromHand(G, currentPlayer, uuid);

  // reset states
  selectedCardIndex.reset(G, currentPlayer);
  selectedCardObject.reset(G, currentPlayer);
  selectedCardInteractionContext.reset(G, currentPlayer);
};

export default playMinionCard;
