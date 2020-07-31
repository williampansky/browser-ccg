import { MECHANICS as ENUMS } from '@ccg/enums';
import hasBoon from './has-boon';
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
import drawCard from '../moves/draw-card';
import summonEntourageMinion from './summon';
import initOnPlayMechanic from '../on-plays/init-on-play-mechanic';
import handleBoons from '../boons/handle-boons';
import playerSpellDamage from '../state/player-spell-damage';

/**
 * Recalculates card mechanics of the provided slotObject.
 * @param {obect} G
 * @param {object} ctx
 * @param {object} slotObject
 * @param {number} index
 */
// prettier-ignore
const recalculateCardMechanics = (G, ctx, player, slotObject, index) => {
  const { 
    minionData: { entourage, id, mechanics, numberPrimary, set }
  } = slotObject;

  /**
   * Helper function that returns boolean if key is
   * present in the provided array param.
   * @param {array} array
   * @param {string} key
   * @memberof initCardMechanics
   */
  const has = (array, key) => array.find(m => m === ENUMS[key]) ? true : false;

  if (has(mechanics, 'BOON'))
    hasBoon.enable(G, player, index);
    // console.log(has(mechanics, 'BOON'))

  if (has(mechanics, 'EVENT'))
    hasEventListener.enable(G, player, index);

  if (has(mechanics, 'ON_DEATH'))
    hasOnDeath.enable(G, player, index);

  if (has(mechanics, 'SPELL_DAMAGE'))
    playerSpellDamage.subtract(G, player, numberPrimary);
};

export default recalculateCardMechanics;
