import React from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated, config } from 'react-spring';
import styles from './styles.module.scss';
import { CardInteractionLayer } from '@ccg/components';
import { useEffect } from 'react';

const HandSlot = ({
  cardImageBaseSrc,
  cardImageFlairSrc,
  cardObject,
  cardUuid,
  handleCardInteractionClick,
  selectedCardUuid,
  slotIndex,
  trayIsExpanded
}) => {
  const [expanded, set] = React.useState(false);
  const props = useSpring({ marginLeft: expanded ? '10%' : '-15%' });

  useEffect(() => {
    trayIsExpanded ? set(true) : set(false);
  }, [trayIsExpanded]);

  return (
    <animated.div
      className={styles['hand__slot']}
      data-component="HandSlot"
      style={props}
    >
      <CardInteractionLayer
        card={cardObject}
        cardImageBaseSrc={cardImageBaseSrc}
        cardImageFlairSrc={cardImageFlairSrc}
        handleInteractionClick={handleCardInteractionClick}
        index={slotIndex}
        isPlayable={slotIndex === 1 ? true : false}
        isSelected={selectedCardUuid === cardUuid ? true : false}
      />
    </animated.div>
  );
};

HandSlot.propTypes = {};

export default HandSlot;
