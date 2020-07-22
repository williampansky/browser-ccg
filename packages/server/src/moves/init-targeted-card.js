import { RACE, PLAY_CONTEXT } from '@ccg/enums';
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
import spellObject from '../state/spell-object';

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
  const { cost, id, playContext, race, uuid } = selectedCardObj[currentPlayer];

  if (!id) return console.error('initTargetedCard() id is not defined.');
  spellObject.set(G, currentPlayer, id);

  switch (playContext) {
    case PLAY_CONTEXT['DAMAGE']:
    case PLAY_CONTEXT['DESTROY']:
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden) slot.canBeAttackedBySpell = true;
      });
      break;

    case PLAY_CONTEXT['BOON']:
    case PLAY_CONTEXT['BUFF']:
      G.boards[currentPlayer].forEach(slot => {
        slot.canBeBuffed = true;
      });
      break;

    case PLAY_CONTEXT['DEBUFF']:
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden) slot.canBeDebuffed = true;
      });
      break;

    default:
      G.boards[currentPlayer].forEach(slot => {
        slot.canBeAttackedBySpell = false;
      });
      G.boards[otherPlayer].forEach(slot => {
        slot.canBeAttackedBySpell = false;
      });
      break;
  }
};

export default initTargetedCard;
