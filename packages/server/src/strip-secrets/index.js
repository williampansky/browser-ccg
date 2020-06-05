/**
 * Strips away the nested fields
 * from the opposing player's client.
 *
 * @param {Object} G game state object.
 * @param {Number} playerID player's unique playOrder ID.
 * @see https://boardgame.io/documentation/#/secret-state
 */
const stripSecrets = (G, playerID) => ({
  ...G
});

export default stripSecrets;
