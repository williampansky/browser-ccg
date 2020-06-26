import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated, config } from 'react-spring';
import { CardInteractionLayer } from '@ccg/components';
import styles from './styles.module.scss';

const MobileHandSlot = props => {
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

  const springStyles = useSpring({
    marginLeft: handleTrayIsExpandedStyle(),
    pointerEvents: trayIsExpandedState ? 'auto' : 'none',
    config: config.default
  });

  useEffect(() => {
    trayIsExpanded
      ? setTrayIsExpandedState(true)
      : setTrayIsExpandedState(false);
  }, [trayIsExpanded]);

  return (
    <animated.div
      className={[
        styles['hand__slot'],
        disableInteraction ? 'disable-interaction' : ''
      ].join(' ')}
      data-component="MobileHandSlot"
      data-index={slotIndex}
      style={springStyles}
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
        isDesktop={isDesktop}
      />
    </animated.div>
  );
};

MobileHandSlot.propTypes = {
  cardImageBaseSrc: PropTypes.string.isRequired,
  cardImageFlairSrc: PropTypes.string.isRequired,
  cardObject: PropTypes.object.isRequired,
  cardUuid: PropTypes.string.isRequired,
  handleCardInteractionClick: PropTypes.func,
  selectedCardUuid: PropTypes.string,
  slotIndex: PropTypes.number.isRequired,
  trayIsExpanded: PropTypes.bool,
  disableInteraction: PropTypes.bool,
  isDesktop: PropTypes.bool.isRequired
};

MobileHandSlot.defaultProps = {
  handleCardInteractionClick: () => {
    console.error(
      'MobileHandSlot: handleCardInteractionClick() provided as a defaultProp'
    );
  },
  selectedCardUuid: null,
  trayIsExpanded: false,
  disableInteraction: false
};

export default MobileHandSlot;
