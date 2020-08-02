import spellObject from '../../state/spell-object';
import initTargetedCardById from './init-via-card-id';
import initTargetedCardPlayContext from './init-via-play-context';
import specialCaseCardID from './special-case-cards';

/**
 * @param {object} G
 * @param {object} ctx
 * @param {object} cardObject
 * @param {number} cardIndex
 */
const initTargetedCard = (G, ctx, cardObject, cardIndex) => {
  const { currentPlayer } = ctx;
  const { id } = cardObject;

  if (!id) return console.error('initTargetedCard() id is not defined.');
  spellObject.set(G, currentPlayer, id);

  if (specialCaseCardID.includes(id)) {
    return initTargetedCardById(G, ctx, cardObject, cardIndex);
  } else {
    return initTargetedCardPlayContext(G, ctx, cardObject, cardIndex);
  }
};

export default initTargetedCard;
