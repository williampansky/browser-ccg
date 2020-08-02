import { generateNameHTML } from './html.log';
import { TYPE } from '@ccg/enums';
import exists from '../utils/element-exists';

const logMinionAttackedMinionMessage = (
  G,
  currentPlayer,
  otherPlayer,
  index
) => {
  const YOUR_MINION = G.selectedMinionObject[currentPlayer];
  const THEIR_MINION = G.boards[otherPlayer][index];
  if (!exists(YOUR_MINION) || !exists(THEIR_MINION)) return;
  const YM_NAME = generateNameHTML(YOUR_MINION.minionData, TYPE['MINION']);
  const TM_NAME = generateNameHTML(THEIR_MINION.minionData, TYPE['MINION']);

  return `Player ${currentPlayer}'s ${YM_NAME} attacked Player ${otherPlayer}'s ${TM_NAME} for ${YOUR_MINION.currentAttack} damage.`;
};

export default logMinionAttackedMinionMessage;
