import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';
import { INTERACTIONS } from '@ccg/images';
import { RACE } from '@ccg/enums/src';
import { getMinionInteractionImage } from '@ccg/utils/src';

export default function CanBeHealed(props) {
  const {
    activeState,
    onClick,
    race,
    hasBulwark,
    interactionImages: {
      canBeBuffedSrc,
      canBeBuffedBulwarkSrc,
      canBeBuffedLocation,
      canBeBuffedLocationBulwarkSrc
    }
  } = props;

  const [styles, set, stop] = useSpring(() => ({
    opacity: 0,
    pointerEvents: 'none'
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
      className="minion__interaction minion__interaction--can-be-buffed"
      data-file="minion-interactions/CanBeHealed"
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
      style={styles}
    >
      {race === RACE['LOCATION'] ? (
        hasBulwark ? (
          <img alt="" role="presentation" src={canBeBuffedLocationBulwarkSrc} />
        ) : (
          <img alt="" role="presentation" src={canBeBuffedLocation} />
        )
      ) : hasBulwark ? (
        <img alt="" role="presentation" src={canBeBuffedBulwarkSrc} />
      ) : (
        <img alt="" role="presentation" src={canBeBuffedSrc} />
      )}
    </animated.div>
  );
}

CanBeHealed.propTypes = {};
