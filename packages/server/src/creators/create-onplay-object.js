import getCardByID from '../utils/get-card-by-id';

/**
 * Creates an object with Warcry-specific key:values.
 * @param {string} cardId
 * @returns {{
 *  id: string
 *  amount: number
 *  spellType: string
 *  spellContext: string
 *  targetingArrowText: string
 * }}
 */
const createOnPlayObject = cardId => {
  const CARD_OBJECT = getCardByID(cardId);
  return {
    id: CARD_OBJECT.id,
    amount: CARD_OBJECT.warcryNumber,
    name: CARD_OBJECT.name,
    rarity: CARD_OBJECT.rarity,
    set: CARD_OBJECT.set,
    entourage: CARD_OBJECT.entourage,
    numberPrimary: CARD_OBJECT.numberPrimary,
    numberSecondary: CARD_OBJECT.numberSecondary,
    playType: CARD_OBJECT.playType,
    playContext: CARD_OBJECT.playContext,
    targetingArrowText: CARD_OBJECT.targetingArrowText
  };
};

export default createOnPlayObject;
