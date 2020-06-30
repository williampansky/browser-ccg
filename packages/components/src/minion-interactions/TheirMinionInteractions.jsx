import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// child components
import CanBeAttackedByMinion from './CanBeAttackedByMinion';
import CanBeAttackedByPlayer from './CanBeAttackedByPlayer';
import CanBeAttackedBySpell from './CanBeAttackedBySpell';
import CanBeAttackedByOnPlay from './CanBeAttackedByOnPlay';
import CanBeDebuffed from './CanBeDebuffed';
import CanBeExpired from './CanBeExpired';
import CanBeReturned from './CanBeReturned';

export default function TheirMinionInteractions(props) {
  const {
    race,
    hasBulwark,
    canBeAttackedByMinion,
    handleCanBeAttackedByMinionFunction,
    interactionImages: {
      canBeAttackedSrc,
      canBeAttackedBulwarkSrc,
      canBeAttackedLocSrc,
      canBeAttackedLocBulwarkSrc
    }
  } = props;

  const [activeState, setActiveState] = useState(null);

  const handleActiveStateCallback = useCallback(byMinion => {
    if (byMinion) return setActiveState('canBeAttackedByMinion');
    else return setActiveState(null);
  }, []);

  useEffect(() => {
    handleActiveStateCallback(canBeAttackedByMinion);
  }, [handleActiveStateCallback, canBeAttackedByMinion]);

  // if (canBeAttackedBySpell) {
  //   return <CanBeAttackedBySpell moves={moves} index={index} />;
  // }

  // if (CanBeAttackedByOnPlay) {
  //   return <CanBeAttackedByOnPlay moves={moves} index={index} />;
  // }

  // if (canBeAttackedByMinion) {
  return (
    <div
      className="minion__interaction"
      data-active={activeState !== null ? true : false}
      data-component="TheirMinionInteractions"
    >
      <CanBeAttackedByMinion
        race={race}
        hasBulwark={hasBulwark}
        activeState={activeState === 'canBeAttackedByMinion' ? true : false}
        onClick={handleCanBeAttackedByMinionFunction}
        canBeAttackedSrc={canBeAttackedSrc}
        canBeAttackedBulwarkSrc={canBeAttackedBulwarkSrc}
        canBeAttackedLocSrc={canBeAttackedLocSrc}
        canBeAttackedLocBulwarkSrc={canBeAttackedLocBulwarkSrc}
      />
    </div>
  );
  // }

  // if (canBeAttackedByPlayer) {
  //   return <CanBeAttackedByPlayer moves={moves} index={index} />;
  // }

  // if (canBeDebuffed) {
  //   return <CanBeDebuffed moves={moves} index={index} />;
  // }

  // if (canBeReturned) {
  //   return <CanBeReturned moves={moves} index={index} targetContext={2} />;
  // }

  // if (canBeExpired) {
  //   return <CanBeExpired moves={moves} index={index} />;
  // }
}

TheirMinionInteractions.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  data: PropTypes.object,
  index: PropTypes.number,
  canBeAttackedByMinion: PropTypes.bool,
  canBeAttackedByPlayer: PropTypes.bool,
  canBeAttackedBySpell: PropTypes.bool
};
