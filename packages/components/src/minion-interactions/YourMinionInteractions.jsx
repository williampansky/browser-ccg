import React from 'react';
import PropTypes from 'prop-types';

// child components
import { CanAttack, IsAttacking } from '@ccg/components';
// import CanBeAttackedByMinion from './CanBeAttackedByMinion';
// import CanBeAttackedByPlayer from './CanBeAttackedByPlayer';
// import CanBeAttackedBySpell from './CanBeAttackedBySpell';
// import CanBeAttackedByWarcry from './CanBeAttackedByWarcry';
// import CanBeBuffed from './CanBeBuffed';
// import CanBeDebuffed from './CanBeDebuffed';
// import CanBeExpired from './CanBeExpired';
// import CanBeHealed from './CanBeHealed';
// import CanBeReturned from './CanBeReturned';
// import CanBeSacrificed from './CanBeSacrificed';
// import CanBeStolen from './CanBeStolen';
// import canReceiveBubble from './CanReceiveBubble';
// import CanReceiveGuard from './CanReceiveBulwark';
// import canReceiveDoubleAttack from './CanReceiveDoubleAttack';
// import IsAttacking from './IsAttacking';

export default function YourMinionInteractions(props) {
  const {
    canAttack,
    isAttacking,
    handleCanAttackFunction,
    handleIsAttackingFunction
  } = props;

  // if (dev && canBeAttackedBySpell) {
  //   return <CanBeAttackedBySpell moves={moves} index={index} />;
  // }

  // if (dev && canBeAttackedByWarcry) {
  //   return <CanBeAttackedByWarcry moves={moves} index={index} />;
  // }

  // if (dev && canBeAttackedByMinion) {
  //   return (
  //     <CanBeAttackedByMinion G={G} ctx={ctx} moves={moves} index={index} />
  //   );
  // }

  // if (dev && canBeAttackedByPlayer) {
  //   return <CanBeAttackedByPlayer moves={moves} index={index} />;
  // }

  // if (canBeHealed) {
  //   return (
  //     <CanBeHealed G={G} ctx={ctx} moves={moves} index={index} board={board} />
  //   );
  // }

  // if (canBeBuffed) {
  //   return <CanBeBuffed G={G} ctx={ctx} moves={moves} index={index} />;
  // }

  // if (canBeDebuffed) {
  //   return <CanBeDebuffed moves={moves} index={index} />;
  // }

  // if (canBeExpired) {
  //   return <CanBeExpired moves={moves} index={index} />;
  // }

  // if (canBeReturned) {
  //   return <CanBeReturned moves={moves} index={index} targetContext={1} />;
  // }

  // if (canBeSacrificed) {
  //   return <CanBeSacrificed moves={moves} index={index} />;
  // }

  // if (canBeStolen) {
  //   return <CanBeStolen moves={moves} index={index} />;
  // }

  // if (canReceiveBubble) {
  //   return <canReceiveBubble moves={moves} index={index} />;
  // }

  // if (canReceiveGuard) {
  //   return <CanReceiveGuard G={G} ctx={ctx} moves={moves} index={index} />;
  // }

  // if (canReceiveDoubleAttack) {
  //   return <canReceiveDoubleAttack G={G} ctx={ctx} moves={moves} index={index} />;
  // }

  if (isAttacking) {
    return (
      <IsAttacking handleIsAttackingFunction={handleIsAttackingFunction} />
    );
  } else if (canAttack) {
    return <CanAttack handleCanAttackFunction={handleCanAttackFunction} />;
  }

  // if (canAttack && isAttacking) {
  //   return <IsAttacking moves={moves} />;
  // }

  return null;
}

YourMinionInteractions.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  slotObject: PropTypes.object,
  index: PropTypes.number,
  board: PropTypes.string,
  canAttack: PropTypes.bool
};
