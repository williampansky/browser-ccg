import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Card } from '@ccg/components';

const CardInteractionLayer = ({
  card,
  cardImageBaseSrc,
  cardImageFlairSrc,
  handleInteractionClick,
  index,
  isPlayable,
  isSelected
}) => {
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
    if (isSelected) return 'card__interaction--is-selected';
    else if (isPlayable) return 'card__interaction--is-playable';
    else return '';
  }, [isPlayable, isSelected]);

  const handleInteractionModule = useCallback(() => {
    if (isSelected) return styles['card__interaction--is-selected'];
    else if (isPlayable) return styles['card__interaction--is-playable'];
    else return '';
  }, [isPlayable, isSelected]);

  return (
    <div
      className={[
        styles['card__interaction__layer'],
        handleInteractionClass(),
        handleInteractionModule()
      ].join(' ')}
      data-file="CardInteractionLayer"
      data-index={index}
      onClick={e => handleInteractionClick(e, card, isPlayable, isSelected)}
      onKeyPress={e => handleInteractionClick(e, card, isPlayable, isSelected)}
      role={isPlayable ? 'button' : 'presentation'}
      tabIndex={isPlayable ? 'button' : 'presentation'}
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
    </div>
  );
};

CardInteractionLayer.propTypes = {
  card: PropTypes.object.isRequired,
  cardImageBaseSrc: PropTypes.string.isRequired,
  cardImageFlairSrc: PropTypes.string.isRequired,
  handleInteractionClick: PropTypes.func,
  index: PropTypes.number.isRequired,
  isPlayable: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired
};

CardInteractionLayer.defaultProps = {
  handleInteractionClick: () => {}
};

export default CardInteractionLayer;
