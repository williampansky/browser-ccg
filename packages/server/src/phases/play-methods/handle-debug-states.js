import counts from '../../state/counts';
import getCardByID from '../../utils/get-card-by-id';
import handleCardPlayability from '../../utils/handle-card-playability';

/**
 * Handles various debug states set from `G.serverConfig` object.
 * @param {object} G
 * @param {string} player
 */
const handleDebugStates = (G, player) => {
  // debug card
  if (G.serverConfig.debugData.enableDebugCard === true) {
    if (G.players[player].hand.length >= 9) return;
    const debugCardID = G.serverConfig.debugData.debugCard;
    G.players[player].hand.push(getCardByID(debugCardID));
    counts.incrementHand(G, player);
    handleCardPlayability(G, player);
  }
};

export default handleDebugStates;
