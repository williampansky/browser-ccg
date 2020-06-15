import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Hero } from '@ccg/components';

const Opponent = props => {
  const {
    avatarPlaceholderImageSrc,
    cardsInDeckCount,
    cardsInHandCount,
    costGemImageSrc,
    heroAbilities,
    heroSymbol,
    yourId,
    playerName
  } = props;

  return (
    <div className={styles['opponent']} data-component="Opponent">
      <Hero
        avatarPlaceholderImageSrc={avatarPlaceholderImageSrc}
        cardIsSelected={false}
        cardsInDeck={cardsInDeckCount}
        cardsInHand={cardsInHandCount}
        costGemImageSrc={costGemImageSrc}
        heroAbilities={heroAbilities}
        heroSymbol={heroSymbol}
        yourId={yourId}
        playerName={playerName}
      />
    </div>
  );
};

Opponent.propTypes = {
  avatarPlaceholderImageSrc: PropTypes.string.isRequired,
  cardsInHandArray: PropTypes.array.isRequired,
  cardsInDeckCount: PropTypes.number.isRequired,
  cardsInHandCount: PropTypes.number.isRequired,
  costGemImageSrc: PropTypes.string.isRequired,
  heroAbilities: PropTypes.array.isRequired,
  heroSymbol: PropTypes.string.isRequired,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  playerDeck: PropTypes.array.isRequired,
  yourId: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  selectedCardObject: PropTypes.object,
  selectedCardUuid: PropTypes.string
};

Opponent.defaultProps = {
  cardsInHandArray: [],
  cardsInDeckCount: 0,
  cardsInHandCount: 0,
  // deselectCardFunction: () => {
  //   console.error('deselectCardFunction() provided as a defaultProp');
  // },
  heroAbilities: [],
  imagesDataCards: {},
  imagesDataSets: {},
  playerDeck: [],
  // selectCardFunction: () => {
  //   console.error('selectCardFunction() provided as a defaultProp');
  // },
  selectedCardObject: null,
  selectedCardUuid: ''
};

export default Opponent;
