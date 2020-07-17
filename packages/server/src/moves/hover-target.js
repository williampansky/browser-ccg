import hoveringTarget from '../state/hovering-target';

/**
 * Sets the `hoveringTarget` value.
 * @param {object} G
 * @param {object} ctx
 * @param {number} index
 */
const hoverTarget = (G, ctx, slotObject, index) => {
  hoveringTarget.set(G, ctx.currentPlayer, slotObject, index);
};

export default hoverTarget;
