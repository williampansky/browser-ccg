import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Card } from '@ccg/components';

const CardInteractionLayer = ({
  card,
  cardImageBaseSrc,
  cardImageFlairSrc,
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

  return (
    <div
      className={[
        styles['card__interaction__layer'],
        isPlayable ? 'card__interaction--is-playable' : ''
      ].join(' ')}
      data-file="CardInteractionLayer"
      data-index={index}
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
    </div>
  );
};

CardInteractionLayer.propTypes = {
  card: PropTypes.object.isRequired,
  cardImageBaseSrc: PropTypes.string.isRequired,
  cardImageFlairSrc: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  isPlayable: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired
};

CardInteractionLayer.defaultProps = {};

export default CardInteractionLayer;
