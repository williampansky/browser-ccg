import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { Card } from '@ccg/components';

const Hand = ({ cardsInHand, imagesDataCards, imagesDataSets }) => {
  return (
    <div className={styles['hand']} data-file="Hand">
      {cardsInHand.map((object, i) => {
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
        } = object;
        return (
          <div className="card__wrapper" key={uuid}>
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
        );
      })}
    </div>
  );
};

Hand.propTypes = {
  cardsInHand: PropTypes.array,
  imagesDataCards: PropTypes.object,
  imagesDataSets: PropTypes.object
};

Hand.defaultProps = {
  cardsInHand: [],
  imagesDataCards: {},
  imagesDataSets: {}
};

export default Hand;
