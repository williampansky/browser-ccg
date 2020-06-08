/**
 * Removes card from your hand.
 * @param {{}} G
 * @param {string} player
 * @param {string} uuid
 */
const removeCardFromHand = (G, player, uuid) => {
  const newHand = G.players[player].hand.filter(c => c.uuid !== uuid);
  G.players[player].hand = newHand;
};

export default removeCardFromHand;
