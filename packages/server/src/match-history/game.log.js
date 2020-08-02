import { generateNameHTML } from './html.log';
import { TYPE } from '@ccg/enums';
import exists from '../utils/element-exists';
import createSpellObject from '../creators/create-spell-object';

export const logGame011Message = (G, currentPlayer) => {
  const YOUR_SPELL = createSpellObject('GAME_011');
  if (!exists(YOUR_SPELL)) return;
  const SPELL_NAME = generateNameHTML(YOUR_SPELL, TYPE['SPELL']);
  return `Player ${currentPlayer} gained 2 Energy Shield points from ${SPELL_NAME}.`;
};

export const logGame009Message = (G, currentPlayer, index) => {
  const YOUR_SPELL = G.spellObject[currentPlayer];
  if (!exists(YOUR_SPELL)) return;
  const SPELL_NAME = generateNameHTML(YOUR_SPELL, TYPE['SPELL']);

  if (index !== null) {
    const YOUR_MINION = G.boards[currentPlayer][index];
    if (!exists(YOUR_MINION)) return;
    const MINION_NAME = generateNameHTML(
      YOUR_MINION.minionData,
      TYPE['MINION']
    );

    return `Player ${currentPlayer} cast ${SPELL_NAME} on ${MINION_NAME}.`;
  } else {
    return `Player ${currentPlayer} cast ${SPELL_NAME} on themself.`;
  }
};

export const logGame010Message = (G, currentPlayer, otherPlayer, index) => {
  const YOUR_SPELL = G.spellObject[currentPlayer];
  if (!exists(YOUR_SPELL)) return;
  const SPELL_NAME = generateNameHTML(YOUR_SPELL, TYPE['SPELL']);

  if (index !== null) {
    const THEIR_MINION = G.boards[otherPlayer][index];
    if (!exists(THEIR_MINION)) return;
    const MINION_NAME = generateNameHTML(
      THEIR_MINION.minionData,
      TYPE['MINION']
    );

    return `Player ${currentPlayer} cast ${SPELL_NAME} on ${MINION_NAME}.`;
  } else {
    return `Player ${currentPlayer} cast ${SPELL_NAME} on Player ${otherPlayer}.`;
  }
};
