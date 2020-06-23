import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';
import { INTERACTIONS } from '@ccg/images';
import { RACE } from '@ccg/enums/src';
import { getMinionInteractionImage } from '@ccg/utils/src';

export default function CanBeAttackedByMinion(props) {
  const {
    activeState,
    onClick,
    race,
    hasBulwark,
    canBeAttackedSrc,
    canBeAttackedLocSrc,
    canBeAttackedLocBulwarkSrc
  } = props;

  const [styles, set, stop] = useSpring(() => ({
    opacity: 1,
    pointerEvents: 'auto'
  }));

  const handleStyleSet = useCallback(
    bool => {
      set({
        opacity: bool ? 1 : 0,
        pointerEvents: bool ? 'auto' : 'none'
      });
    },
    [set]
  );

  useEffect(() => {
    handleStyleSet(activeState);
    return () => stop();
  }, [handleStyleSet, activeState, stop]);

  return (
    <animated.div
      className="minion__interaction minion__interaction--can-be-attacked"
      data-file="minion-interactions/CanBeAttackedByMinion"
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
      style={styles}
    >
      {race === RACE['LOCATION'] ? (
        hasBulwark ? (
          <img alt="" role="presentation" src={canBeAttackedLocBulwarkSrc} />
        ) : (
          <img alt="" role="presentation" src={canBeAttackedLocSrc} />
        )
      ) : (
        <img alt="" role="presentation" src={canBeAttackedSrc} />
      )}
    </animated.div>
  );
}

CanBeAttackedByMinion.propTypes = {
  onClick: PropTypes.func
};

CanBeAttackedByMinion.defaultProps = {
  onClick: () => {}
};
