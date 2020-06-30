import playerCanBeAttacked from './player-can-be-attacked';
import playerCanBeHealed from './player-can-be-healed';
import { _dMCBA, _eMCBA, _eMCBAbW } from './boards.can-be-attacked';
import { _eMCBB } from './boards.can-be-buffed';
import { _eMCBH } from './boards.can-be-healed';

/**
 * When a player selects a minion that can attack, we need to determine its
 * possible targets—both opposing minions and the opposing player.
 * @param {object} G
 * @param {string} player
 */
export const _dAMT = (G, player) => {
  const { boards } = G;
  const MINION_HAS_GUARD = boards[player].find(slot => slot.hasBulwark === true)
    ? true
    : false;

  if (MINION_HAS_GUARD) {
    playerCanBeAttacked.disable(G, player);
  } else if (!MINION_HAS_GUARD) {
    playerCanBeAttacked.enableByMinion(G, player);
  }

  G.boards[player].forEach((slot, i) => {
    if (slot.hasBulwark === true) _eMCBA(G, player, i);
    else if (MINION_HAS_GUARD) _dMCBA(G, player, i);
    else _eMCBA(G, player, i);
  });
};

/**
 * When a player plays a buff action, calculate the possible targets.
 * @param {object} G
 * @param {string} player
 */
export const _dBT = (G, player, index) => {
  G.boards[player].forEach((_, i) => {
    if (i !== index) _eMCBB(G, player, i);
  });
};

/**
 * When a player plays a heal action, calulate the possible targets.
 * @param {object} G
 * @param {string} player
 */
export const _dHT = (G, player) => {
  playerCanBeAttacked.disable(G, player);
  playerCanBeHealed.enable(G, player);
  G.boards[player].forEach((_, i) => {
    _eMCBH(G, player, i);
  });
};

/**
 * When a player plays a minion with a targeted OnPlay effect object; we need
 * to determine the possible targets.
 * @param {object} G
 * @param {string} player
 */
export const _dOPT = (G, player) => {
  playerCanBeAttacked.enableByOnPlay(G, player);
  G.boards[player].forEach((_, i) => _eMCBAbW(G, player, i));
};

/**
 * When a player plays a minion with a targeted Spell object; we need to
 * determine the possible targets.
 * @param {object} G
 * @param {string} player
 */
export const _dST = (G, player) => {
  playerCanBeAttacked.enableBySpell(G, player);
  G.boards[player].forEach((_, i) => _eMCBA(G, player, i));
};
