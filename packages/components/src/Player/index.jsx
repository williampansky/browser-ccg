import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Hand, Hero } from '@ccg/components';

const Player = ({
  abilitiesImageBase,
  abilitiesImageClose,
  avatarPlaceholderImageSrc,
  cardsInHandArray,
  cardsInDeckCount,
  cardsInHandCount,
  costGemImageSrc,
  heroAbilities,
  heroSymbol,
  imagesDataCards,
  imagesDataSets,
  playerDeck,
  playerId,
  playerName
}) => {
  const handleInteractionClick = useCallback(() => {}, []);

  return (
    <div className={styles['player']} data-component="Player">
      <Hero
        abilitiesImageBase={abilitiesImageBase}
        abilitiesImageClose={abilitiesImageClose}
        avatarPlaceholderImageSrc={avatarPlaceholderImageSrc}
        cardsInDeck={cardsInDeckCount}
        cardsInHand={cardsInHandCount}
        costGemImageSrc={costGemImageSrc}
        heroAbilities={heroAbilities}
        heroSymbol={heroSymbol}
        playerDeck={playerDeck}
        playerId={playerId}
        playerName={playerName}
      />
      <Hand
        cardsInHand={cardsInHandArray}
        imagesDataCards={imagesDataCards}
        imagesDataSets={imagesDataSets}
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
  heroAbilities: PropTypes.array.isRequired,
  heroSymbol: PropTypes.string.isRequired,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  playerDeck: PropTypes.array.isRequired,
  playerId: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired
};

Player.defaultProps = {
  cardsInHandArray: [],
  cardsInDeckCount: 0,
  cardsInHandCount: 0,
  heroAbilities: [],
  imagesDataCards: {},
  imagesDataSets: {},
  playerDeck: []
};

export default Player;
