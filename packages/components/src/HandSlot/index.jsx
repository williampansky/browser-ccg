import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated, config } from 'react-spring';
import { CardInteractionLayer } from '@ccg/components';
import styles from './styles.module.scss';

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
    disableInteraction
  } = props;

  const [trayIsExpandedState, setTrayIsExpandedState] = useState(false);

  const handleTrayIsExpandedStyle = useCallback(() => {
    if (disableInteraction) return '-60px';
    else if (trayIsExpandedState) return '30px';
    else return '-60px';
  }, [disableInteraction, trayIsExpandedState]);

  const style = useSpring({
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
      data-component="HandSlot"
      style={style}
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
