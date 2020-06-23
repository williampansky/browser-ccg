import boards from '../state/boards';
import selectedCardInteractionContext from '../state/selected-card-interaction-context';
import selectedCardIndex from '../state/selected-card-index';
import selectedCardObject from '../state/selected-card-object';
import createBoardSlotObject from '../creators/create-board-slot-object';
import initCardMechanics from '../mechanics/init-mechanics';

/**
 * @param {object} G
 * @param {object} ctx
 * @param {object} cardObject
 * @param {number} index
 */
const playMinionCard = (G, ctx, index) => {
  const { selectedCardObject: selectedCardObj, serverConfig } = G;
  const { currentPlayer } = ctx;
  const { id } = selectedCardObj[currentPlayer];
  const slotObject = createBoardSlotObject(id);

  // play card into board
  boards.placeCardOnBoard(G, currentPlayer, slotObject, index);

  // check and init and mechanics
  if (serverConfig.debugData.enableMechanics)
    initCardMechanics(G, ctx, slotObject, index);

  // reset states
  selectedCardIndex.reset(G, currentPlayer);
  selectedCardObject.reset(G, currentPlayer);
  selectedCardInteractionContext.reset(G, currentPlayer);
};

export default playMinionCard;
