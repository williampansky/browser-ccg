import { generateNameHTML } from './html.log';
import { TYPE } from '@ccg/enums';
import exists from '../utils/element-exists';

const logCastTargetedSpellAtMinionMessage = (
  G,
  currentPlayer,
  otherPlayer,
  index
) => {
  const YOUR_CARD = G.selectedCardObject[currentPlayer];
  const THEIR_MINION = G.boards[otherPlayer][index];
  if (!exists(YOUR_CARD) || !exists(THEIR_MINION)) return;
  const YC_NAME = generateNameHTML(YOUR_CARD, TYPE['SPELL']);
  const TM_NAME = generateNameHTML(THEIR_MINION.minionData, TYPE['MINION']);

  function damagePhrase() {
    let phrase = '';
    if (!YOUR_CARD.warcryNumber) phrase = '';
    else if (exists(YOUR_CARD.warcryNumber))
      phrase = ` for ${YOUR_CARD.warcryNumber} damage`;
    else if (YOUR_CARD.warcryNumber !== 0)
      phrase = ` for ${YOUR_CARD.warcryNumber} damage`;
    return phrase;
  }

  return `Player ${currentPlayer} cast ${YC_NAME} on Player ${otherPlayer}'s ${TM_NAME}${damagePhrase()}.`;
};

export default logCastTargetedSpellAtMinionMessage;
