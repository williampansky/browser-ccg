/**
 * Resets various interactive states back to default.
 * @param {object} G
 */
const resetInteractionStatesOnEnd = G => {
  // reset player states
  G.playerCanAttack = { '0': false, '1': false };
  G.playerCanBeAttackedByMinion = { '0': false, '1': false };
  G.playerCanBeAttackedByPlayer = { '0': false, '1': false };
  G.playerCanBeAttackedBySpell = { '0': false, '1': false };
  G.playercanBeAttackedByOnPlay = { '0': false, '1': false };
  G.playerCanBeHealed = { '0': false, '1': false };
  G.playerHasAttacked = { '0': false, '1': false };
  G.playerIsAttacking = { '0': false, '1': false };

  // reset card states
  G.hoveringCardIndex = { '0': null, '1': null };
  G.selectedCardIndex = { '0': null, '1': null };
  G.selectedCardObject = { '0': null, '1': null };

  // reset minion states
  G.selectedMinionIndex = { '0': null, '1': null };
  G.selectedMinionObject = { '0': null, '1': null };
  G.attackedMinionIndex = null;

  // reset warcry states
  G.warcryObject = { '0': null, '1': null };
};

export default resetInteractionStatesOnEnd;
