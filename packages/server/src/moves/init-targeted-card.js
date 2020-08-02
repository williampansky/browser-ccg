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

  // prettier-ignore
  const specialCaseCardID = [
    'CORE_089',
    'CORE_090', 'CORE_093',
    'CORE_113', 'CORE_126'
  ]

  if (specialCaseCardID.includes(id)) {
    switch (id) {
      case 'CORE_089':
        G.boards[otherPlayer].forEach(slot => {
          if (!slot.isHidden && slot.currentAttack <= 3) {
            slot.canBeAttackedBySpell = true;
            slot.showTooltip = true;
          }
        });
        return;

      case 'CORE_090':
        G.boards[otherPlayer].forEach(slot => {
          if (!slot.isHidden && slot.currentAttack >= 5) {
            slot.canBeAttackedBySpell = true;
            slot.showTooltip = true;
          }
        });
        return;

      case 'CORE_093':
        G.boards[otherPlayer].forEach(slot => {
          if (!slot.isHidden && slot.currentHealth === slot.totalHealth) {
            slot.canBeAttackedBySpell = true;
            slot.showTooltip = true;
          }
        });
        return;

      case 'CORE_113':
        G.boards[currentPlayer].forEach(slot => {
          if (slot.minionData.race === RACE['DEMONIC']) {
            slot.canBeAttackedBySpell = true;
            slot.showTooltip = true;
          }
        });
        return;

      case 'CORE_126':
        G.boards[otherPlayer].forEach(slot => {
          if (!slot.isHidden && slot.currentHealth < slot.totalHealth) {
            slot.canBeAttackedBySpell = true;
            slot.showTooltip = true;
          }
        });
        return;

      default:
        return;
    }
  }

  switch (playContext) {
    case PLAY_CONTEXT['DAMAGE']:
    case PLAY_CONTEXT['DESTROY']:
    case PLAY_CONTEXT['EXPIRATION']:
    case PLAY_CONTEXT['TRANSFORM']:
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden) {
          slot.canBeAttackedBySpell = true;
          slot.showTooltip = true;
        }
      });
      return;

    case PLAY_CONTEXT['BOON']:
    case PLAY_CONTEXT['BUFF']:
    case PLAY_CONTEXT['RUSH']:
      G.boards[currentPlayer].forEach(slot => {
        slot.canBeBuffed = true;
        slot.showTooltip = true;
      });
      return;

    case PLAY_CONTEXT['DEBUFF']:
    case PLAY_CONTEXT['DISABLE']:
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden) {
          slot.canBeDebuffed = true;
          slot.showTooltip = true;
        }
      });
      return;

    case PLAY_CONTEXT['HEAL']:
      G.boards[currentPlayer].forEach(slot => {
        slot.canBeHealed = true;
        slot.showTooltip = true;
      });
      return;

    case PLAY_CONTEXT['STEAL']:
      G.boards[otherPlayer].forEach(slot => {
        slot.canBeDebuffed = true;
        slot.canBeStolen = true;
        slot.showTooltip = true;
      });
      return;

    default:
      G.boards[currentPlayer].forEach(slot => {
        slot.canBeAttackedBySpell = false;
        slot.showTooltip = false;
      });
      G.boards[otherPlayer].forEach(slot => {
        slot.canBeAttackedBySpell = false;
        slot.showTooltip = false;
      });
      return;
  }
};

export default initTargetedCard;
