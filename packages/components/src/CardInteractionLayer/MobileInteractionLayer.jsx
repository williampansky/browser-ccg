import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated, config } from 'react-spring';
import { Card } from '@ccg/components';
import styles from './styles.module.scss';

const MobileInteractionLayer = props => {
  const {
    card,
    cardImageBaseSrc,
    cardImageFlairSrc,
    handleCardInteractionClick,
    index,
    isPlayable,
    isSelected,
    trayIsExpanded,
    disableInteraction
  } = props;

  const [trayIsExpandedState, setTrayIsExpandedState] = useState(false);
  const style = useSpring({
    pointerEvents: trayIsExpandedState ? 'auto' : 'none',
    config: config.default
  });

  useEffect(() => {
    trayIsExpanded
      ? setTrayIsExpandedState(true)
      : setTrayIsExpandedState(false);
  }, [trayIsExpanded]);

  const {
    active,
    artist,
    attack,
    collectible,
    cost,
    deckBuilder,
    elite,
    entourage,
    flavor,
    health,
    howToEarn,
    howToEarnGolden,
    id,
    isGolden,
    mechanics,
    name,
    numberOvercharge,
    numberPrimary,
    numberRNG,
    numberSecondary,
    onClick,
    playContext,
    playRequirements,
    playType,
    race,
    rarity,
    set,
    sounds,
    targetingArrowText,
    text,
    type,
    uuid
  } = card;

  const handleInteractionClass = useCallback(() => {
    if (disableInteraction) return 'disable-interaction';
    else if (isSelected) return 'card__interaction--is-selected';
    else if (isPlayable) return 'card__interaction--is-playable';
    else return '';
  }, [disableInteraction, isPlayable, isSelected]);

  return (
    <animated.div
      className={[
        styles['card__interaction__layer'],
        handleInteractionClass()
      ].join(' ')}
      data-component="MobileInteractionLayer"
      data-index={index}
      onClick={() => handleCardInteractionClick(card, index)}
      onKeyPress={() => handleCardInteractionClick(card, index)}
      role={isPlayable ? 'button' : 'presentation'}
      tabIndex={isPlayable ? 'button' : 'presentation'}
      style={style}
    >
      <Card
        active={active}
        artist={artist}
        attack={attack}
        collectible={collectible}
        cost={cost}
        deckBuilder={deckBuilder}
        elite={elite}
        entourage={entourage}
        flavor={flavor}
        health={health}
        howToEarn={howToEarn}
        howToEarnGolden={howToEarnGolden}
        id={id}
        imageBaseSrc={cardImageBaseSrc}
        imageFlairSrc={cardImageFlairSrc}
        isGolden={isGolden}
        mechanics={mechanics}
        name={name}
        numberOvercharge={numberOvercharge}
        numberPrimary={numberPrimary}
        numberRNG={numberRNG}
        numberSecondary={numberSecondary}
        onClick={onClick}
        playContext={playContext}
        playRequirements={playRequirements}
        playType={playType}
        race={race}
        rarity={rarity}
        set={set}
        sounds={sounds}
        targetingArrowText={targetingArrowText}
        text={text}
        type={type}
        uuid={uuid}
      />

      <div className="card__effect--is-playable" />
      <div className="card__effect--is-selected" />
    </animated.div>
  );
};

MobileInteractionLayer.propTypes = {
  card: PropTypes.object.isRequired,
  cardImageBaseSrc: PropTypes.string.isRequired,
  cardImageFlairSrc: PropTypes.string.isRequired,
  handleCardInteractionClick: PropTypes.func,
  index: PropTypes.number.isRequired,
  isPlayable: PropTypes.bool,
  isSelected: PropTypes.bool,
  trayIsExpanded: PropTypes.bool,
  disableInteraction: PropTypes.bool
};

MobileInteractionLayer.defaultProps = {
  // handleInteractionClick: () => {
  //   console.error(
  //     'MobileInteractionLayer: handleInteractionClick() provided as a defaultProp'
  //   );
  // },
  isPlayable: false,
  isSelected: false,
  trayIsExpanded: false,
  disableInteraction: false
};

export default MobileInteractionLayer;
