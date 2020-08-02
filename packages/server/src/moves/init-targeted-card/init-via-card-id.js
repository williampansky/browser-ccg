import { RACE } from '@ccg/enums';

const initTargetedCardById = (G, ctx, object, index) => {
  const { turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const { id } = object;

  switch (id) {
    case 'CORE_089':
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden && slot.currentAttack <= 3) {
          slot.canBeAttackedBySpell = true;
          slot.showTooltip = true;
        }
      });
      break;

    case 'CORE_090':
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden && slot.currentAttack >= 5) {
          slot.canBeAttackedBySpell = true;
          slot.showTooltip = true;
        }
      });
      break;

    case 'CORE_093':
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden && slot.currentHealth === slot.totalHealth) {
          slot.canBeAttackedBySpell = true;
          slot.showTooltip = true;
        }
      });
      break;

    case 'CORE_113':
      G.boards[currentPlayer].forEach(slot => {
        if (slot.minionData.race === RACE['DEMONIC']) {
          slot.canBeAttackedBySpell = true;
          slot.showTooltip = true;
        }
      });
      break;

    case 'CORE_126':
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden && slot.currentHealth < slot.totalHealth) {
          slot.canBeAttackedBySpell = true;
          slot.showTooltip = true;
        }
      });
      break;

    default:
      break;
  }
};

export default initTargetedCardById;
