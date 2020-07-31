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
 * Initialize card mechanics on the targeted slotObject.
 * @param {obect} G
 * @param {object} ctx
 * @param {object} slotObject
 * @param {number} index
 */
// prettier-ignore
const initCardMechanics = (G, ctx, slotObject, index) => {
  const { 
    minionData: { entourage, id, mechanics, numberPrimary, set }
  } = slotObject;
  const { currentPlayer } = ctx;

  /**
   * Helper function that returns boolean if key is
   * present in the provided array param.
   * @param {array} array
   * @param {string} key
   * @memberof initCardMechanics
   */
  const has = (array, key) => array.find(m => m === ENUMS[key]) ? true : false;

  if (has(mechanics, 'BOON'))
    hasBoon.enable(G, currentPlayer, index);

  if (has(mechanics, 'BUBBLE'))
    hasBubble.enable(G, currentPlayer, index);

  // if (has(mechanics, 'BUFF'))
  //   hasBubble.enable(G, currentPlayer, index);

  if (has(mechanics, 'BULWARK'))
    hasBulwark.enable(G, currentPlayer, index);

  if (has(mechanics, 'CANT_TARGET'))
    hasCantTarget.enable(G, currentPlayer, index);

  if (has(mechanics, 'DISCOVER'))
    initDiscover(G, currentPlayer);

  if (has(mechanics, 'DOUBLE_ATTACK') && !has(mechanics, 'ON_PLAY')) 
    hasDoubleAttack.enable(G, currentPlayer, index);

  if (has(mechanics, 'DRAW_CARD'))
    drawCard(G, ctx, currentPlayer, 1);

  if (has(mechanics, 'EVENT'))
    hasEventListener.enable(G, currentPlayer, index);

  if (has(mechanics, 'HIDDEN'))
    isHidden.enable(G, currentPlayer, index);

  if (has(mechanics, 'LIFESTEAL'))
    hasLifesteal.enable(G, currentPlayer, index);

  if (has(mechanics, 'ON_DEATH'))
    hasOnDeath.enable(G, currentPlayer, index);

  if (has(mechanics, 'ON_PLAY'))
    initOnPlayMechanic(G, ctx, slotObject, id, set, index);

  if (has(mechanics, 'POISON'))
    hasPoison.enable(G, currentPlayer, index);

  if (has(mechanics, 'RUSH'))
    initRush(G, currentPlayer, index);

  if (has(mechanics, 'SPELL_DAMAGE')) {
    hasSpellDamage.enable(G, currentPlayer, index);
    playerSpellDamage.add(G, currentPlayer, numberPrimary);
  }

  if (has(mechanics, 'SUMMON'))
    summonEntourageMinion(G, ctx, id, entourage);
};

export default initCardMechanics;
