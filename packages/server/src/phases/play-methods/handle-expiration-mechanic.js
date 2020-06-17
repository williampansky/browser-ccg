/**
 * Handles various aspects of the `willExpire` mechanic.
 * @param {object} slot Board slot
 */
const handleExpirationMechanic = slot => {
  if (slot.willExpire === true) {
    // deincrement willExpireIn integer
    slot.willExpireIn = Math.abs(slot.willExpireIn - 1);

    // kill minion if expiration integer hits zero
    if (slot.willExpireIn === 0) {
      // boards.subtractFromMinionHealth(G, otherPlayer, i, 9000);
      // boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
    }
  } else {
    slot.willExpireIn = 2;
  }
};

export default handleExpirationMechanic;
