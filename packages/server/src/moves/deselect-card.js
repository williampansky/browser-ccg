import hoveringTarget from '../state/hovering-target';
import selectedCardIndex from '../state/selected-card-index';
import selectedCardObject from '../state/selected-card-object';
import spellObject from '../state/spell-object';
import boards from '../state/boards';

/**
 * @param {object} G
 * @param {object} ctx
 */
const deselectCard = (G, ctx) => {
  const { turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  selectedCardIndex.reset(G, currentPlayer);
  selectedCardObject.reset(G, currentPlayer);
  hoveringTarget.reset(G, currentPlayer);
  spellObject.reset(G, currentPlayer);

  G.selectedCardType = { '0': null, '1': null };
  G.selectedCardPlayType = { '0': null, '1': null };
  G.selectedCardPlayContext = { '0': null, '1': null };
  G.playerCanBeAttackedBySpell = { '0': false, '1': false };
  // G.playerSpellDamage = { '0': 0, '1': 0 };

  boards.disableAllEverything(G, currentPlayer);
  boards.disableAllEverything(G, otherPlayer);
};

export default deselectCard;
