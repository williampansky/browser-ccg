import { generateNameHTML } from './html.log';
import { TYPE } from '@ccg/enums';
import exists from '../utils/element-exists';

const logPlayerAttackedMinionMessage = (
  G,
  currentPlayer,
  otherPlayer,
  index
) => {
  const THEIR_MINION = G.boards[otherPlayer][index];
  if (!exists(THEIR_MINION)) return;
  const TM_NAME = generateNameHTML(THEIR_MINION.minionData, TYPE['MINION']);

  return `Player ${currentPlayer} attacked Player ${otherPlayer}'s ${TM_NAME} for ${G.playerAttackValue[currentPlayer]} damage.`;
};

export default logPlayerAttackedMinionMessage;
