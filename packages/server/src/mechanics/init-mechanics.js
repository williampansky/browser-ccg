import { MECHANICS as ENUMS } from '@ccg/enums';
import hasBubble from './has-bubble';
import hasBulwark from './has-bulwark';
import hasCantTarget from './has-cant-target';
import hasDoubleAttack from './has-double-attack';
import hasEventListener from './has-event-listener';
import hasLifesteal from './has-lifesteal';
import hasOnDeath from './has-on-death';
import hasPoison from './has-poison';
import hasSpellDamage from './has-spell-damage';
import initDiscover from './discover';
import initRush from './has-rush';
import isHidden from './is-hidden';

/**
 * Initialize card mechanics on the targeted slotObject.
 * @param {obect} G
 * @param {object} ctx
 * @param {object} slotObject
 * @param {number} index
 */
// prettier-ignore
const initCardMechanics = (G, ctx, slotObject, index) => {
  const { minionData: { mechanics } } = slotObject;
  const { currentPlayer } = ctx;

  /**
   * Helper function that returns boolean if key is
   * present in the provided array param.
   * @param {array} array
   * @param {string} key
   * @memberof initCardMechanics
   */
  const has = (array, key) => array.find(m => m === ENUMS[key]) ? true : false;

  if (has(mechanics, 'BUBBLE')) hasBubble.enable(G, currentPlayer, index);
  if (has(mechanics, 'BULWARK')) hasBulwark.enable(G, currentPlayer, index);
  if (has(mechanics, 'CANT_TARGET')) hasCantTarget.enable(G, currentPlayer, index);
  if (has(mechanics, 'DISCOVER')) initDiscover(G, currentPlayer);

  if (has(mechanics, 'DOUBLE_ATTACK') && !has(mechanics, 'ON_PLAY')) 
    hasDoubleAttack.enable(G, currentPlayer, index);

  if (has(mechanics, 'EVENT')) hasEventListener.enable(G, currentPlayer, index);
  if (has(mechanics, 'HIDDEN')) isHidden.enable(G, currentPlayer, index);
  if (has(mechanics, 'LIFESTEAL')) hasLifesteal.enable(G, currentPlayer, index);
  if (has(mechanics, 'ON_DEATH')) hasOnDeath.enable(G, currentPlayer, index);
  if (has(mechanics, 'POISON')) hasPoison.enable(G, currentPlayer, index);
  if (has(mechanics, 'RUSH')) initRush(G, currentPlayer, index);
  if (has(mechanics, 'SPELL_DAMAGE')) hasSpellDamage.enable(G, currentPlayer, index);
};

export default initCardMechanics;
