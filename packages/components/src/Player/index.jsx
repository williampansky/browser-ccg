import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Hand, Hero } from '@ccg/components';

const Player = props => {
  const {
    abilitiesImageBase,
    abilitiesImageClose,
    avatarPlaceholderImageSrc,
    cardsInHandArray,
    cardsInDeckCount,
    cardsInHandCount,
    costGemImageSrc,
    deselectCardFunction,
    heroAbilities,
    heroSymbol,
    imagesDataCards,
    imagesDataSets,
    playerDeck,
    yourId,
    playerName,
    selectCardFunction,
    selectedCardObject,
    selectedCardUuid
  } = props;

  const handleCardInteractionClick = useCallback(
    (event, cardObject, cardIsPlayable, cardIsSelected) => {
      event.preventDefault();
      if (cardIsSelected) return deselectCardFunction();
      else if (cardIsPlayable) return selectCardFunction(cardObject);
      else return;
    },
    [deselectCardFunction, selectCardFunction]
  );

  return (
    <div className={styles['player']} data-component="Player">
      <Hero
        abilitiesImageBase={abilitiesImageBase}
        abilitiesImageClose={abilitiesImageClose}
        avatarPlaceholderImageSrc={avatarPlaceholderImageSrc}
        cardIsSelected={selectedCardUuid ? true : false}
        cardsInDeck={cardsInDeckCount}
        cardsInHand={cardsInHandCount}
        costGemImageSrc={costGemImageSrc}
        heroAbilities={heroAbilities}
        heroSymbol={heroSymbol}
        playerDeck={playerDeck}
        yourId={yourId}
        playerName={playerName}
      />
      <Hand
        cardsInHand={cardsInHandArray}
        deselectCardFunction={deselectCardFunction}
        handleCardInteractionClick={handleCardInteractionClick}
        imagesDataCards={imagesDataCards}
        imagesDataSets={imagesDataSets}
        selectedCardObject={selectedCardObject}
        selectedCardUuid={selectedCardUuid}
      />
    </div>
  );
};

Player.propTypes = {
  abilitiesImageBase: PropTypes.string.isRequired,
  abilitiesImageClose: PropTypes.string.isRequired,
  avatarPlaceholderImageSrc: PropTypes.string.isRequired,
  cardsInHandArray: PropTypes.array.isRequired,
  cardsInDeckCount: PropTypes.number.isRequired,
  cardsInHandCount: PropTypes.number.isRequired,
  costGemImageSrc: PropTypes.string.isRequired,
  deselectCardFunction: PropTypes.func.isRequired,
  heroAbilities: PropTypes.array.isRequired,
  heroSymbol: PropTypes.string.isRequired,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  playerDeck: PropTypes.array.isRequired,
  yourId: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  selectCardFunction: PropTypes.func.isRequired,
  selectedCardObject: PropTypes.object,
  selectedCardUuid: PropTypes.string
};

Player.defaultProps = {
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

export default Player;
