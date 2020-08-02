import { SET } from '@ccg/enums';
import castTargetedSet002SpellAtMinion from '../spells/cast-targeted-set002-spell-at-minion';
import actionPoints from '../state/action-points';
import counts from '../state/counts';
import removeCardFromHand from '../utils/remove-card-from-hand';
import copyCardToPlayedCards from '../utils/copy-card-to-played-cards';
import selectedCardIndex from '../state/selected-card-index';
import selectedCardInteractionContext from '../state/selected-card-interaction-context';
import selectedCardObject from '../state/selected-card-object';
import handleCardPlayability from '../utils/handle-card-playability';
import boards from '../state/boards';
import deselectCard from './deselect-card';
import logMessage from '../match-history/log-message';

/**
 * Interacts with a minion (index) via the current player's spellObject.
 * @param {object} G
 * @param {object} ctx
 * @param {number} index
 */
const attackMinionWithSpell = (G, ctx, index) => {
  const {
    selectedCardObject: selectedCardObjectG,
    serverConfig,
    spellObject,
    turnOrder
  } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  // eject if spellObject or cardObject is null
  const SPELL_OBJECT = spellObject[currentPlayer];
  if (!SPELL_OBJECT)
    return console.error('Error in attackMinionWithSpell: !SPELL_OBJECT');
  const CARD_OBJECT = selectedCardObjectG[currentPlayer];
  if (!CARD_OBJECT)
    return console.error('Error in attackMinionWithSpell: !CARD_OBJECT');

  // eject if minion doesn't exist
  const MINION_BEING_ATTACKED_INDEX = index;
  const MINION_BEING_ATTACKED = G.boards[otherPlayer][index];
  if (!MINION_BEING_ATTACKED)
    return console.error(
      'Error in attackMinionWithSpell: !MINION_BEING_ATTACKED'
    );

  // eject if MINION_BEING_ATTACKED can't be attacked or debuffed or etc...
  // if (
  //   !MINION_BEING_ATTACKED.canBeAttackedBySpell ||
  //   !MINION_BEING_ATTACKED.canBeDebuffed
  // )
  //   return console.error(
  //     'Error in attackMinionWithSpell: !canBeAttackedBySpell || !canBeDebuffed'
  //   );

  logMessage(G, ctx, 'attackMinion', null, MINION_BEING_ATTACKED_INDEX);

  switch (SPELL_OBJECT.set) {
    // core
    case SET[2]:
      castTargetedSet002SpellAtMinion(
        G,
        ctx,
        SPELL_OBJECT.id,
        MINION_BEING_ATTACKED,
        MINION_BEING_ATTACKED_INDEX
      );
      break;

    // eject
    default:
      break;
  }

  // subtract the card's cost from player's current actionPoints count
  if (serverConfig.debugData.enableCost)
    actionPoints.subtract(G, currentPlayer, CARD_OBJECT.cost);

  if (serverConfig.debugData.enableRemoveCardFromHand) {
    // move to your playerCards array
    copyCardToPlayedCards(G, currentPlayer, CARD_OBJECT.id);
    // and then remove card from your hand
    removeCardFromHand(G, currentPlayer, CARD_OBJECT.uuid);
    // then deincrement your hand count
    counts.deincrementHand(G, currentPlayer);
  }

  // reset states
  deselectCard(G, ctx);
  selectedCardIndex.reset(G, currentPlayer);
  selectedCardObject.reset(G, currentPlayer);
  selectedCardInteractionContext.reset(G, currentPlayer);
  boards.disableAllCanBeAttacked(G, otherPlayer);
  boards.disableAllCanBeDebuffed(G, otherPlayer);

  // loop thru your board and check for
  // event listener mechanic minions
  G.boards[currentPlayer].forEach((slot, i) => {
    const {
      minionData: { id }
    } = slot;

    switch (id) {
      default:
        break;
    }
  });

  // loop thru your hand and recalculate actionPoints/costs
  handleCardPlayability(G, currentPlayer);
};

export default attackMinionWithSpell;
