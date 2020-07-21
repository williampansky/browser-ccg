import createSpellObject from '../creators/create-spell-object';

const spellObject = {
  __DATA_MODEL: {
    '0': null,
    '1': null
  },
  set: (G, player, cardId) => setSpellObject(G, player, cardId),
  reset: (G, player) => resetSpellObject(G, player)
};

/**
 * Sets the value of `spellObject` if `cardId` is provided;
 * otherwise sets the value to null.
 * @param {object} G
 * @param {object} ctx
 * @param {string} cardId
 */
export const setSpellObject = (G, player, cardId) => {
  G.spellObject[player] = createSpellObject(cardId);
};

export const resetSpellObject = (G, player) => {
  G.spellObject[player] = null;
};

export default spellObject;
