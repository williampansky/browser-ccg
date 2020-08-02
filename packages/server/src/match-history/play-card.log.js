import { generateNameHTML } from './html.log';
import { TYPE } from '@ccg/enums';
import exists from '../utils/element-exists';
import logSystemErrorMessage from './system-error.log';

const logPlayGlobalSpellCardMessage = (G, player) => {
  const YOUR_CARD = G.selectedCardObject[player];
  if (!exists(YOUR_CARD)) return;
  const CARD_NAME = generateNameHTML(YOUR_CARD, TYPE['SPELL']);
  return `Player ${player} cast ${CARD_NAME} spell.`;
};

const logPlayMinionCardMessage = (G, player) => {
  const YOUR_CARD = G.selectedCardObject[player];
  if (!exists(YOUR_CARD)) return;
  const CARD_NAME = generateNameHTML(YOUR_CARD, TYPE['MINION']);
  return `Player ${player} summoned a ${CARD_NAME} minion.`;
};

const logPlayWeaponCardMessage = (G, player, cardId) => {
  // const YOUR_WEAPON = createWeaponObject(cardId);
  const YOUR_WEAPON = G.playerWeapon[player];
  if (!exists(YOUR_WEAPON)) return logSystemErrorMessage();
  const WEAPON_NAME = generateNameHTML(YOUR_WEAPON, TYPE['WEAPON']);
  return `Player ${player} equipped a ${WEAPON_NAME} weapon.`;
};

const logPlayCardMessage = (G, player, action) => {
  const YOUR_CARD = G.selectedCardObject[player];
  if (!exists(YOUR_CARD)) return;
  const { id } = YOUR_CARD;

  switch (action) {
    case 'playGlobalSpellCard':
      return logPlayGlobalSpellCardMessage(G, player);

    case 'playMinionCard':
      return logPlayMinionCardMessage(G, player);

    case 'playWeaponCard':
      return logPlayWeaponCardMessage(G, player, id);

    default:
      return;
  }
};

export default logPlayCardMessage;
