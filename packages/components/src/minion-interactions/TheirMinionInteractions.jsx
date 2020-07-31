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
    moves: { attackMinionWithSpell },
    race,
    hasBulwark,
    canBeAttackedByMinion,
    canBeAttackedBySpell,
    canBeAttackedByOnPlay,
    canSetHoverTarget,
    handleHoverTargetFunction,
    handleCanBeAttackedByMinionFunction,
    handleCanBeAttackedBySpellFunction,
    handleCanBeAttackedByOnPlayFn,
    index,
    slotObject,
    slotObject: { canBeDebuffed },
    interactionImages: {
      canBeAttackedSrc,
      canBeAttackedBulwarkSrc,
      canBeAttackedLocSrc,
      canBeAttackedLocBulwarkSrc
    }
  } = props;

  const [activeState, setActiveState] = useState(null);

  const handleActiveStateCallback = useCallback(
    (byMinion, bySpell, byOnPlay, byDebuff) => {
      if (byDebuff) return setActiveState('canBeDebuffed');
      else if (byMinion) return setActiveState('canBeAttackedByMinion');
      else if (bySpell) return setActiveState('canBeAttackedBySpell');
      else if (byOnPlay) return setActiveState('canBeAttackedByOnPlay');
      else return setActiveState(null);
    },
    []
  );

  useEffect(() => {
    handleActiveStateCallback(
      canBeAttackedByMinion,
      canBeAttackedBySpell,
      canBeAttackedByOnPlay,
      canBeDebuffed
    );
  }, [
    handleActiveStateCallback,
    canBeAttackedByMinion,
    canBeAttackedBySpell,
    canBeAttackedByOnPlay,
    canBeDebuffed
  ]);

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
        handleHoverTargetFunction={handleHoverTargetFunction}
        canSetHoverTarget={canSetHoverTarget}
        index={index}
        slotObject={slotObject}
      />
      <CanBeAttackedBySpell
        race={race}
        hasBulwark={hasBulwark}
        activeState={activeState === 'canBeAttackedBySpell' ? true : false}
        onClick={handleCanBeAttackedBySpellFunction}
        canBeAttackedSrc={canBeAttackedSrc}
        canBeAttackedBulwarkSrc={canBeAttackedBulwarkSrc}
        canBeAttackedLocSrc={canBeAttackedLocSrc}
        canBeAttackedLocBulwarkSrc={canBeAttackedLocBulwarkSrc}
        handleHoverTargetFunction={handleHoverTargetFunction}
        canSetHoverTarget={canSetHoverTarget}
        index={index}
        slotObject={slotObject}
      />
      <CanBeAttackedBySpell
        race={race}
        hasBulwark={hasBulwark}
        activeState={activeState === 'canBeAttackedByOnPlay' ? true : false}
        onClick={handleCanBeAttackedByOnPlayFn}
        canBeAttackedSrc={canBeAttackedSrc}
        canBeAttackedBulwarkSrc={canBeAttackedBulwarkSrc}
        canBeAttackedLocSrc={canBeAttackedLocSrc}
        canBeAttackedLocBulwarkSrc={canBeAttackedLocBulwarkSrc}
        handleHoverTargetFunction={handleHoverTargetFunction}
        canSetHoverTarget={canSetHoverTarget}
        index={index}
        slotObject={slotObject}
      />
      <CanBeDebuffed
        activeState={activeState === 'canBeDebuffed' ? true : false}
        onClick={() => attackMinionWithSpell(index)}
        {...props}
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
