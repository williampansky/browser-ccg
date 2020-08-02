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
import logMessage from '../match-history/log-message';

/**
 * Interacts with a minion (index) via the current player's spellObject.
 * @param {object} G
 * @param {object} ctx
 * @param {number} index
 */
const targetMinionWithSpell = (G, ctx, index) => {
  const {
    selectedCardObject: selectedCardObjectG,
    serverConfig,
    spellObject
  } = G;
  const { currentPlayer } = ctx;

  // eject if spellObject or cardObject is null
  const SPELL_OBJECT = spellObject[currentPlayer];
  if (!SPELL_OBJECT)
    return console.error('Error in targetMinionWithSpell: !SPELL_OBJECT');
  const CARD_OBJECT = selectedCardObjectG[currentPlayer];
  // if (!CARD_OBJECT)
  //   return console.error('Error in targetMinionWithSpell: !CARD_OBJECT');

  // eject if MINION_BEING_ATTACKED can't be attacked
  const MINION_BEING_TARGETED = G.boards[currentPlayer][index];
  const MINION_BEING_TARGETED_INDEX = index;
  // if (
  //   MINION_BEING_TARGETED &&
  //   (!MINION_BEING_TARGETED.canBeBuffed || !MINION_BEING_TARGETED.canBeHealed)
  // )
  //   return console.error(
  //     'Error in attackMinionWithSpell: !MINION_BEING_ATTACKED.canBeBuffed'
  //   );

  logMessage(G, ctx, 'attackMinion', null, MINION_BEING_TARGETED_INDEX);

  switch (SPELL_OBJECT.set) {
    // core
    case SET[2]:
      castTargetedSet002SpellAtMinion(
        G,
        ctx,
        SPELL_OBJECT.id,
        MINION_BEING_TARGETED,
        MINION_BEING_TARGETED_INDEX
      );
      break;

    // eject
    default:
      break;
  }

  // subtract the card's cost from player's current actionPoints count
  if (serverConfig.debugData.enableCost && CARD_OBJECT)
    actionPoints.subtract(G, currentPlayer, CARD_OBJECT.cost);

  if (serverConfig.debugData.enableRemoveCardFromHand && CARD_OBJECT) {
    // move to your playerCards array
    copyCardToPlayedCards(G, currentPlayer, CARD_OBJECT.id);
    // and then remove card from your hand
    removeCardFromHand(G, currentPlayer, CARD_OBJECT.uuid);
    // then deincrement your hand count
    counts.deincrementHand(G, currentPlayer);
  }

  // reset states
  selectedCardIndex.reset(G, currentPlayer);
  selectedCardObject.reset(G, currentPlayer);
  selectedCardInteractionContext.reset(G, currentPlayer);
  boards.disableAllCanBeBuffed(G, currentPlayer);
  boards.disableAllCanBeHealed(G, currentPlayer);

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

export default targetMinionWithSpell;
