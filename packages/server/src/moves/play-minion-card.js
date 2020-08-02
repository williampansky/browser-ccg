import { RACE } from '@ccg/enums';
import actionPoints from '../state/action-points';
import boards from '../state/boards';
import copyCardToPlayedCards from '../utils/copy-card-to-played-cards';
import counts from '../state/counts';
import createBoardSlotObject from '../creators/create-board-slot-object';
import drawCard from './draw-card';
import handleCardPlayability from '../utils/handle-card-playability';
import initCardMechanics from '../mechanics/init-mechanics';
import removeCardFromHand from '../utils/remove-card-from-hand';
import selectedCardIndex from '../state/selected-card-index';
import selectedCardInteractionContext from '../state/selected-card-interaction-context';
import selectedCardObject from '../state/selected-card-object';
import handleBoons from '../boons/handle-boons';
import logMessage from '../match-history/log-message';

/**
 * @param {object} G
 * @param {object} ctx
 * @param {object} cardObject
 * @param {number} index
 */
const playMinionCard = (G, ctx, index) => {
  const { selectedCardObject: selectedCardObj, serverConfig, turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const { cost, id, race, uuid } = selectedCardObj[currentPlayer];
  const slotObject = createBoardSlotObject(id);

  // play card into board
  boards.placeCardOnBoard(G, ctx, currentPlayer, slotObject, index);

  // subtract the card's cost from player's current actionPoints count
  if (serverConfig.debugData.enableCost)
    actionPoints.subtract(G, currentPlayer, cost);

  // check and init any mechanics
  if (serverConfig.debugData.enableMechanics)
    initCardMechanics(G, ctx, slotObject, index);

  if (serverConfig.debugData.enableRemoveCardFromHand) {
    // move to your playerCards array
    copyCardToPlayedCards(G, currentPlayer, id);
    // and then remove card from your hand
    removeCardFromHand(G, currentPlayer, uuid);
    // then deincrement your hand count
    counts.deincrementHand(G, currentPlayer);
  }

  // handle boons after minion is placed
  handleBoons(G, ctx, currentPlayer);
  handleBoons(G, ctx, otherPlayer);

  // log message
  logMessage(G, ctx, 'playMinionCard');

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
      case 'CORE_061':
        if (race === RACE[1] && i !== index) drawCard(G, ctx, currentPlayer, 1);
        break;

      case 'CORE_062':
        if (race === RACE[1]) G.boards[currentPlayer][index].canAttack = true;
        break;

      default:
        break;
    }
  });

  // loop thru your hand and recalculate actionPoints/costs
  handleCardPlayability(G, currentPlayer);
};

export default playMinionCard;
