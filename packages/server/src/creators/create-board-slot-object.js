import createMinionObject from './create-minion-object';

const createBoardSlotObject = cardId => {
  const minionObject = createMinionObject(cardId);
  if (!minionObject) return;

  const { attack, health } = minionObject;

  return {
    canAttack: false,
    canBeAttackedByMinion: false,
    canBeAttackedByPlayer: false,
    canBeAttackedBySpell: false,
    canBeAttackedByWarcry: false,
    canBeBuffed: false,
    canBeHealed: false,
    canBeDebuffed: false,
    canBeExpired: false,
    canBeReturned: false,
    canBeSacrificed: false,
    canBeStolen: false,
    canReceiveEnergyShield: false,
    canReceiveGuard: false,
    canReceiveOnslaught: false,
    currentAttack: attack,
    currentHealth: health,
    hasAttacked: false,
    hasBoon: false,
    hasEnergyShield: false,
    hasGuard: false,
    isAttacking: false,
    isAttackingMinionIndex: null,
    isAttackingMinionPlayer: false,
    isConcealed: false,
    isCursed: false,
    isDead: false,
    isDisabled: false,
    isDisabledFor: 2,
    minionData: minionObject,
    hasOnslaught: false,
    hasOnslaughtAttack: 1,
    totalAttack: attack,
    totalHealth: health,
    willExpire: false,
    willExpireIn: 2
  };
};

export default createBoardSlotObject;
