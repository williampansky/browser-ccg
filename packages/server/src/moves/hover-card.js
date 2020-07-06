import hoveringCardIndex from '../state/hovering-card-index';

/**
 * Sets the `hoveringCardIndex` value.
 * @param {{}} G
 * @param {{}} ctx
 * @param {number} index
 */
const hoverCard = (G, ctx, index) => {
  const { set } = hoveringCardIndex;
  return set(G, ctx, index);
};

export default hoverCard;
