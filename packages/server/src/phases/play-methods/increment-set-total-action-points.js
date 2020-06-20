import actionPoints from '../../state/action-points';

/**
 * Increments total AP, then sets the current AP
 * to match the new total.
 * @param {object} G
 * @param {string} player
 */
const incrementAndSetTotalActionPoints = (G, player) => {
  actionPoints.incrementTotal(G, player);
  actionPoints.matchTotal(G, player);
};

export default incrementAndSetTotalActionPoints;
