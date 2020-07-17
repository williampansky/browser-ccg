import hoveringTarget from '../state/hovering-target';
import selectedCardIndex from '../state/selected-card-index';
import selectedCardObject from '../state/selected-card-object';

/**
 * @param {object} G
 * @param {object} ctx
 */
const deselectCard = (G, ctx) => {
  const { turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  selectedCardIndex.reset(G, currentPlayer);
  selectedCardObject.reset(G, currentPlayer);
  hoveringTarget.reset(G, currentPlayer);

  G.boards[otherPlayer].forEach(slot => {
    slot.canBeAttackedByMinion = false;
    slot.canBeAttackedByPlayer = false;
    slot.canBeAttackedBySpell = false;
    slot.canBeAttackedByOnPlay = false;
  });

  G.selectedCardType = { '0': null, '1': null };
  G.selectedCardPlayType = { '0': null, '1': null };
  G.selectedCardPlayContext = { '0': null, '1': null };
  G.playerCanBeAttackedBySpell = { '0': false, '1': false };
  G.playerSpellDamage = { '0': 0, '1': 0 };

  G.boards[currentPlayer].forEach(slot => {
    slot.canBeAttackedByMinion = false;
    slot.canBeAttackedByOnPlay = false;
    slot.canBeAttackedByPlayer = false;
    slot.canBeAttackedBySpell = false;
    slot.canBeBuffed = false;
    slot.canBeDebuffed = false;
    slot.canBeDestroyed = false;
    slot.canBeExpired = false;
    slot.canBeHealed = false;
    slot.canBeReturned = false;
    slot.canBeStolen = false;
    slot.canReceiveBubble = false;
    slot.canReceiveBulwark = false;
    slot.canReceiveDoubleAttack = false;
    slot.canReceiveRush = false;
  });

  G.boards[otherPlayer].forEach(slot => {
    slot.canBeAttackedByMinion = false;
    slot.canBeAttackedByOnPlay = false;
    slot.canBeAttackedByPlayer = false;
    slot.canBeAttackedBySpell = false;
    slot.canBeBuffed = false;
    slot.canBeDebuffed = false;
    slot.canBeDestroyed = false;
    slot.canBeExpired = false;
    slot.canBeHealed = false;
    slot.canBeReturned = false;
    slot.canBeStolen = false;
    slot.canReceiveBubble = false;
    slot.canReceiveBulwark = false;
    slot.canReceiveDoubleAttack = false;
    slot.canReceiveRush = false;
  });
};

export default deselectCard;
