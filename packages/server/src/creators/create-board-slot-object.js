import { v4 as uuidv4 } from 'uuid';
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
    canBeAttackedByOnPlay: false,
    canBeBuffed: false,
    canBeDebuffed: false,
    canBeDestroyed: false,
    canBeExpired: false,
    canBeHealed: false,
    canBeReturned: false,
    canBeStolen: false,
    canReceiveBubble: false,
    canReceiveBulwark: false,
    canReceiveDoubleAttack: false,
    canReceiveRush: false,
    currentAttack: attack,
    currentHealth: health,
    hasAttacked: false,
    hasBoon: false,
    hasBubble: false,
    hasBulwark: false,
    hasCantTarget: false,
    hasDoubleAttack: false,
    hasDoubleAttackCount: 1,
    hasEventListener: false,
    hasLifesteal: false,
    hasNoAttack: false,
    hasOnDeath: false,
    hasPoison: false,
    hasRush: false,
    hasSpellDamage: false,
    isAttacking: false,
    isAttackingMinionIndex: null,
    isAttackingPlayer: false,
    isBooned: false,
    isBuffed: false,
    isDead: false,
    isDebuffed: false,
    isDisabled: false,
    isDisabledFor: 2,
    isHidden: false,
    isImmune: false,
    isSilenced: false,
    minionData: minionObject,
    slotIsNew: true,
    showTooltip: false,
    totalAttack: attack,
    totalHealth: health,
    uuid: uuidv4(),
    wasAttacked: false,
    willExpire: false,
    willExpireIn: 2
  };
};

export default createBoardSlotObject;
