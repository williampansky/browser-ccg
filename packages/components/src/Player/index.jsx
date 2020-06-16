import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Hand, Hero } from '@ccg/components';

const Player = props => {
  const {
    abilitiesImageBase,
    abilitiesImageClose,
    avatarPlaceholderImageSrc,
    cardsInDeckCount,
    cardsInHandArray,
    cardsInHandCount,
    costGemImageSrc,
    deselectCardFunction,
    actionPointsCurrent,
    actionPointsTotal,
    heroAbilities,
    heroSymbol,
    imagesDataCards,
    imagesDataSets,
    playerDeck,
    playerHealthCurrent,
    playerHealthTotal,
    playerName,
    selectCardFunction,
    selectedCardObject,
    selectedCardUuid,
    yourId,
    selectedCardContext
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
        actionPointsCurrent={actionPointsCurrent}
        actionPointsTotal={actionPointsTotal}
        heroAbilities={heroAbilities}
        heroSymbol={heroSymbol}
        parentComponent="Player"
        playerDeck={playerDeck}
        playerHealthCurrent={playerHealthCurrent}
        playerHealthTotal={playerHealthTotal}
        playerName={playerName}
        yourId={yourId}
        selectedCardContext={selectedCardContext}
      />
      <Hand
        cardsInHand={cardsInHandArray}
        deselectCardFunction={deselectCardFunction}
        handleCardInteractionClick={handleCardInteractionClick}
        imagesDataCards={imagesDataCards}
        imagesDataSets={imagesDataSets}
        selectedCardObject={selectedCardObject}
        selectedCardUuid={selectedCardUuid}
        selectedCardContext={selectedCardContext}
      />
    </div>
  );
};

Player.propTypes = {
  abilitiesImageBase: PropTypes.string.isRequired,
  abilitiesImageClose: PropTypes.string.isRequired,
  avatarPlaceholderImageSrc: PropTypes.string.isRequired,
  cardsInDeckCount: PropTypes.number.isRequired,
  cardsInHandArray: PropTypes.array.isRequired,
  cardsInHandCount: PropTypes.number.isRequired,
  costGemImageSrc: PropTypes.string.isRequired,
  actionPointsCurrent: PropTypes.number.isRequired,
  actionPointsTotal: PropTypes.number.isRequired,
  deselectCardFunction: PropTypes.func.isRequired,
  heroAbilities: PropTypes.array.isRequired,
  heroSymbol: PropTypes.string.isRequired,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  playerDeck: PropTypes.array.isRequired,
  playerHealthCurrent: PropTypes.number.isRequired,
  playerHealthTotal: PropTypes.number.isRequired,
  playerName: PropTypes.string.isRequired,
  selectCardFunction: PropTypes.func.isRequired,
  selectedCardObject: PropTypes.object,
  selectedCardUuid: PropTypes.string,
  yourId: PropTypes.string.isRequired
};

Player.defaultProps = {
  cardsInHandArray: [],
  cardsInDeckCount: 0,
  cardsInHandCount: 0,
  deselectCardFunction: () => {},
  heroAbilities: [],
  imagesDataCards: {},
  imagesDataSets: {},
  playerDeck: [],
  selectCardFunction: () => {},
  selectedCardObject: null,
  selectedCardUuid: ''
};

export default Player;
