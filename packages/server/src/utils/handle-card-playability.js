/**
 * Handles various mechanisms related to a card's playability.
 * @param {object} G
 * @param {string} player
 */
const handleCardPlayability = (G, player) => {
  const { actionPoints, serverConfig } = G;
  const { current } = actionPoints[player];

  G.players[player].hand.forEach(card => {
    const { cost } = card;
    if (!serverConfig.debugData.enableCost) card.isPlayable = true;
    else if (current >= cost) card.isPlayable = true;
    else card.isPlayable = false;
  });
};

export default handleCardPlayability;
