import { generateNameHTML } from './html.log';
import { TYPE } from '@ccg/enums';
import exists from '../utils/element-exists';
import logSystemErrorMessage from './system-error.log';

const logCastTargetedSpellAtPlayerMessage = (G, currentPlayer, otherPlayer) => {
  const YOUR_CARD = G.selectedCardObject[currentPlayer];
  if (!exists(YOUR_CARD)) return logSystemErrorMessage();
  const YC_NAME = generateNameHTML(YOUR_CARD, TYPE['SPELL']);

  return `Player ${currentPlayer} cast ${YC_NAME} on Player ${otherPlayer} for ${YOUR_CARD.warcryNumber} damage.`;
};

export default logCastTargetedSpellAtPlayerMessage;
