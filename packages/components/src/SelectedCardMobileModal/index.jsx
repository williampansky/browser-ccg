import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { Card } from '@ccg/components';

const SelectedCardMobileModal = ({ card, imagesDataCards, imagesDataSets }) => {
  if (card === null) return null;

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
      className={styles['selected__card__mobile__modal']}
      data-component="SelectedCardMobileModal"
      id={`selectedCard__${uuid}`}
    >
      <div className={styles['modal__dialog']}>
        <div>
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
            imageBaseSrc={getCardBaseImage(rarity, type, imagesDataCards)}
            imageFlairSrc={getCardFlairImage(id, set, imagesDataSets)}
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
        </div>
      </div>
    </div>
  );
};

SelectedCardMobileModal.propTypes = {
  card: PropTypes.object,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired
};

SelectedCardMobileModal.defaultProps = {
  card: {},
  imagesDataCards: {},
  imagesDataSets: {}
};

export default SelectedCardMobileModal;
