/**
 * Reset player's minion stats back to total values,
 * which should reset turn-only enhancements.
 * @param {object} slot Board slot
 */
const resetSlotAttackBoon = slot => {
  slot.currentAttack = slot.totalAttack;
};

export default resetSlotAttackBoon;
