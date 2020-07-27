import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// child components
import {
  CanAttack,
  CanBeBuffed,
  CanBeHealed,
  IsAttacking
} from '@ccg/components';
// import CanBeAttackedByMinion from './CanBeAttackedByMinion';
// import CanBeAttackedByPlayer from './CanBeAttackedByPlayer';
// import CanBeAttackedBySpell from './CanBeAttackedBySpell';
// import CanBeAttackedByOnPlay from './CanBeAttackedByOnPlay';
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
    moves: { selectMinion, deselectMinion, targetMinionWithSpell },
    slotObject,
    slotObject: { canAttack, isAttacking, canBeBuffed, canBeHealed },
    index
  } = props;

  const [activeState, setActiveState] = useState(null);

  const handleActiveStateCallback = useCallback(
    (canAttack, isAttacking, canBeBuffed, canBeHealed) => {
      if (canBeHealed) return setActiveState('canBeHealed');
      if (canBeBuffed) return setActiveState('canBeBuffed');
      else if (isAttacking) return setActiveState('isAttacking');
      else if (canAttack) return setActiveState('canAttack');
      else return setActiveState(null);
    },
    []
  );

  useEffect(() => {
    handleActiveStateCallback(canAttack, isAttacking, canBeBuffed, canBeHealed);
  }, [
    handleActiveStateCallback,
    canAttack,
    isAttacking,
    canBeBuffed,
    canBeHealed
  ]);

  return (
    <div
      className="minion__interaction"
      data-active={activeState !== null ? true : false}
    >
      <IsAttacking
        activeState={activeState === 'isAttacking' ? true : false}
        onClick={() => deselectMinion()}
        {...props}
      />
      <CanAttack
        activeState={activeState === 'canAttack' ? true : false}
        onClick={() => selectMinion(slotObject, index)}
        {...props}
      />
      <CanBeBuffed
        activeState={activeState === 'canBeBuffed' ? true : false}
        onClick={() => targetMinionWithSpell(index)}
        {...props}
      />
      <CanBeHealed
        activeState={activeState === 'canBeHealed' ? true : false}
        onClick={() => targetMinionWithSpell(index)}
        {...props}
      />
    </div>
  );
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
