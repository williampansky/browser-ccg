/**
 * Enables minion slot's boolean(s) to attack.
 * @param {object} slot Board slot
 */
const enableSlotCanAttack = slot => {
  if (slot.currentAttack >= 1 && !slot.isDisabled && !slot.hasNoAttack)
    slot.canAttack = true;
};

export default enableSlotCanAttack;
