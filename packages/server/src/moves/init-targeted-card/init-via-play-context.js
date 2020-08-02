import { PLAY_CONTEXT } from '@ccg/enums';

const initTargetedCardPlayContext = (G, ctx, object, index) => {
  const { turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const { playContext } = object;

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
      break;

    case PLAY_CONTEXT['BOON']:
    case PLAY_CONTEXT['BUFF']:
    case PLAY_CONTEXT['RUSH']:
      G.boards[currentPlayer].forEach(slot => {
        slot.canBeBuffed = true;
        slot.showTooltip = true;
      });
      break;

    case PLAY_CONTEXT['DEBUFF']:
    case PLAY_CONTEXT['DISABLE']:
      G.boards[otherPlayer].forEach(slot => {
        if (!slot.isHidden) {
          slot.canBeDebuffed = true;
          slot.showTooltip = true;
        }
      });
      break;

    case PLAY_CONTEXT['HEAL']:
      G.boards[currentPlayer].forEach(slot => {
        slot.canBeHealed = true;
        slot.showTooltip = true;
      });
      break;

    case PLAY_CONTEXT['STEAL']:
      G.boards[otherPlayer].forEach(slot => {
        slot.canBeDebuffed = true;
        slot.canBeStolen = true;
        slot.showTooltip = true;
      });
      break;

    default:
      G.boards[currentPlayer].forEach(slot => {
        slot.canBeAttackedBySpell = false;
        slot.showTooltip = false;
      });
      G.boards[otherPlayer].forEach(slot => {
        slot.canBeAttackedBySpell = false;
        slot.showTooltip = false;
      });
      break;
  }
};

export default initTargetedCardPlayContext;
