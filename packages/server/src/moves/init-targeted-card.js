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

/**
 * @param {object} G
 * @param {object} ctx
 * @param {object} cardObject
 * @param {number} index
 */
const initTargetedCard = (G, ctx, object, index) => {
  const { selectedCardObject: selectedCardObj, serverConfig, turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const { cost, id, race, uuid } = selectedCardObj[currentPlayer];

  G.boards[otherPlayer].forEach((slot, i) => {
    slot.canBeAttackedBySpell = true;
  });
};

export default initTargetedCard;
