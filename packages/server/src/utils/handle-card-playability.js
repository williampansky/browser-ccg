/**
 * Handles various mechanisms related to a card's playability.
 * @param {object} G
 * @param {string} player
 */
const handleCardPlayability = (G, player) => {
  const { current: curAP } = G.actionPoints[player];
  G.players[player].hand.forEach(card => {
    const { cost } = card;
    if (curAP >= cost) card.isPlayable = true;
  });
};

export default handleCardPlayability;
