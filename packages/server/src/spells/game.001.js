import { add } from 'mathjs';

/**
 * Gain 1 Action Point for this turn only.
 * @param {object} G energy
 * @param {object} ctx currentPlayer
 * @requires mathjs::add()
 */
const castGame001 = (G, ctx) => {
  const { energy } = G;
  const { currentPlayer } = ctx;
  const { current } = energy[currentPlayer];

  const newTotal = add(Number(current), 1);
  G.energy[ctx.currentPlayer].current = newTotal;
};

export default castGame001;
