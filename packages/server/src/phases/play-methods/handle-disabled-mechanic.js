/**
 * Handles various aspects of the `isDisabled` mechanic.
 * @param {object} slot Board slot
 */
const handleDisabledMechanic = slot => {
  if (slot.isDisabled === true) {
    // deincrement isDisabledFor integer
    slot.isDisabledFor = Math.abs(slot.isDisabledFor - 1);

    // re-enable minion if disabled integer hits zero
    if (slot.isDisabledFor === 0) slot.isDisabled = false;
  } else {
    slot.isDisabledFor = 2;
  }
};

export default handleDisabledMechanic;
