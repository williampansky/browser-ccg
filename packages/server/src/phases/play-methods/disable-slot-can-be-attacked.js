/**
 * Disables minion slot's boolean(s) to be attacked.
 * @param {object} slot Board slot
 */
const disableSlotCanBeAttacked = slot => {
  slot.canBeAttackedByMinion = false;
  slot.canBeAttackedByPlayer = false;
  slot.canBeAttackedBySpell = false;
  slot.canBeAttackedByWarcry = false;
};

export default disableSlotCanBeAttacked;
