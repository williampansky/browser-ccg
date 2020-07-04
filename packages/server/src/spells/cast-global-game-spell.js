import { add } from 'mathjs';
import actionPoints from '../state/action-points';

const castGlobalGameSpell = (G, ctx, cardId) => {
  // prettier-ignore
  switch (cardId) {
    // game
    case 'GAME_001': return castGame001(G, ctx);
    // eject
    default: return;
  }
};

/**
 * Gain 1 Action Point for this turn only.
 * @param {object} G energy
 * @param {object} ctx currentPlayer
 * @requires mathjs::add()
 */
const castGame001 = (G, ctx) => {
  const { currentPlayer } = ctx;
  const { current } = G.actionPoints[currentPlayer];
  const newTotal = add(current, 1);
  actionPoints.setCurrent(G, currentPlayer, newTotal);
};

export default castGlobalGameSpell;
