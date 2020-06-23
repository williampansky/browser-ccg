// import initBoons from 'lib/mechanics/init-boons';
// import initBuffs from 'lib/mechanics/init-buffs';
// import initCurses from 'lib/mechanics/init-curses';
import hasBulwark from './has-bulwark';
// import initStampede from 'lib/mechanics/init-stampede';
// import initWarcrys from 'lib/mechanics/init-warcrys';
// import initEnergyShield from 'lib/mechanics/init-energy-shield';
import { MECHANICS as ENUMS } from '@ccg/enums';

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

  // if (mechanics.find(m => m === MECHANICS[1])) initBoons(G, ctx, card, index);
  // if (mechanics.find(m => m === MECHANICS[2])) initBuffs(G, ctx, card, index);
  // if (mechanics.find(m => m === MECHANICS[3])) initCurses(G, ctx, index);
  // if (mechanics.find(m => m === MECHANICS['BULWARK'])) hasBulwark.enable(G, currentPlayer, index);
  if (has(mechanics, 'BULWARK')) hasBulwark.enable(G, currentPlayer, index);
  // if (mechanics.find(m => m === MECHANICS[5])) initStampede(G, ctx, index);
  // if (mechanics.find(m => m === MECHANICS[6])) initWarcrys(G, ctx, card, index);
  // if (mechanics.find(m => m === MECHANICS[9])) initEnergyShield(G, ctx, index);
};

export default initCardMechanics;
