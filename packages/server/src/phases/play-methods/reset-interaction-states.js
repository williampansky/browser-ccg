/**
 * Resets various interactive states back to default.
 * @param {object} G
 */
const resetInteractionStates = G => {
  // reset card states
  G.hoveringCardIndex = { '0': null, '1': null };
  G.selectedCardIndex = { '0': null, '1': null };
  G.selectedCardObject = { '0': null, '1': null };

  // reset minion states
  G.selectedMinionIndex = { '0': null, '1': null };
  G.selectedMinionObject = { '0': null, '1': null };

  // reset warcry states
  G.warcryObject = { '0': null, '1': null };

  // reset playerUsedClassSkill states
  G.playerUsedClassSkill = { '0': false, '1': false };
};

export default resetInteractionStates;
