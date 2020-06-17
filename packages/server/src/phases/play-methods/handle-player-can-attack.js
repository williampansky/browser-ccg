import playerCanAttack from '../../state/player-can-attack';

/**
 * Determines if player can attack at the start of turn
 * @param {object} G
 * @param {string} player
 */
const handlePlayerCanAttack = (G, player) => {
  if (G.playerWeapon[player] !== null) playerCanAttack.enable(G, player);
};

export default handlePlayerCanAttack;
