import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated, config } from 'react-spring';
import { CardInteractionLayer } from '@ccg/components';
import styles from './styles.module.scss';
import { setCartesianDependencies } from 'mathjs';

const HandSlot = props => {
  const {
    cardImageBaseSrc,
    cardImageFlairSrc,
    cardObject,
    cardUuid,
    handleCardInteractionClick,
    selectedCardUuid,
    slotIndex,
    trayIsExpanded,
    disableInteraction,
    isDesktop
  } = props;

  const [trayIsExpandedState, setTrayIsExpandedState] = useState(false);

  const handleTrayIsExpandedStyle = useCallback(() => {
    if (disableInteraction) return '-60px';
    else if (trayIsExpandedState) return '30px';
    else return '-60px';
  }, [disableInteraction, trayIsExpandedState]);

  const mobileStyles = useSpring({
    marginLeft: handleTrayIsExpandedStyle(),
    pointerEvents: trayIsExpandedState ? 'auto' : 'none',
    config: config.default
  });

  useEffect(() => {
    trayIsExpanded
      ? setTrayIsExpandedState(true)
      : setTrayIsExpandedState(false);
  }, [trayIsExpanded]);

  const [desktopStyles, set, stop] = useSpring(() => ({
    marginLeft: '-150px',
    paddingBottom: '0px',
    pointerEvents: 'auto',
    transform: 'translateY(0px)',
    config: {
      ...config.default,
      easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
    }
  }));

  const handleMouseEnter = useCallback(
    event => {
      event.preventDefault();
      if (!isDesktop) return;
      if (isDesktop) {
        set({
          transform: 'translateY(-200px)'
        });
      }
    },
    [isDesktop, set]
  );

  const handleMouseLeave = useCallback(
    event => {
      event.preventDefault();
      if (!isDesktop) return;
      if (isDesktop) {
        set({
          transform: 'translateY(0px)'
        });
      }
    },
    [isDesktop, set]
  );

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return (
    <animated.div
      className={[
        styles['hand__slot'],
        disableInteraction ? 'disable-interaction' : ''
      ].join(' ')}
      data-component="HandSlot"
      data-index={slotIndex}
      onMouseEnter={e => handleMouseEnter(e)}
      onMouseLeave={e => handleMouseLeave(e)}
      style={isDesktop ? desktopStyles : mobileStyles}
    >
      <CardInteractionLayer
        card={cardObject}
        cardImageBaseSrc={cardImageBaseSrc}
        cardImageFlairSrc={cardImageFlairSrc}
        handleCardInteractionClick={handleCardInteractionClick}
        index={slotIndex}
        isPlayable={true}
        isSelected={selectedCardUuid === cardUuid ? true : false}
        trayIsExpanded={trayIsExpanded}
        disableInteraction={disableInteraction}
      />
    </animated.div>
  );
};

HandSlot.propTypes = {
  cardImageBaseSrc: PropTypes.string.isRequired,
  cardImageFlairSrc: PropTypes.string.isRequired,
  cardObject: PropTypes.object.isRequired,
  cardUuid: PropTypes.string.isRequired,
  handleCardInteractionClick: PropTypes.func,
  selectedCardUuid: PropTypes.string,
  slotIndex: PropTypes.number.isRequired,
  trayIsExpanded: PropTypes.bool
};

HandSlot.defaultProps = {
  // handleCardInteractionClick: () => {
  //   console.error(
  //     'HandSlot: handleCardInteractionClick() provided as a defaultProp'
  //   );
  // },
  selectedCardUuid: null,
  trayIsExpanded: false
};

export default HandSlot;
