/**
 * Reset player's minion stats back to total values,
 * which should reset turn-only enhancements.
 * @param {object} G
 * @param {object} slot Board slot
 */
const resetMinionAttackBoon = (G, slot) => {
  slot.currentAttack = slot.totalAttack;
};

export default resetMinionAttackBoon;
