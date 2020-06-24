/**
 * Used as the determining value of the switch statement in the primary
 * function when interacting with their minion board slots.
 * @name THEIR_INTERACTION_KEYS
 */
export const THEIR_INTERACTION_KEYS = {
  1: 'canBeAttackedByMinion',
  2: 'canBeAttackedByOnPlay',
  3: 'canBeAttackedByPlayer',
  4: 'canBeAttackedBySpell'
};

/**
 * Used as the determining value of the switch statement in the primary
 * function when interacting with your minion board slots.
 * @name YOUR_INTERACTION_KEYS
 */
export const YOUR_INTERACTION_KEYS = {
  1: 'canAttack',
  2: 'isAttacking',
  3: 'canBeBuffed',
  4: 'canBeHealed',
  5: 'canBeReturned',
  6: 'canReceiveBubble',
  7: 'canReceiveBulwark',
  8: 'canReceiveDoubleAttack',
  9: 'canReceiveRush'
};
