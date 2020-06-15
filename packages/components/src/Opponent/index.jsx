import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Hero } from '@ccg/components';

const Opponent = props => {
  const {
    avatarPlaceholderImageSrc,
    cardsInDeckCount,
    cardsInHandCount,
    cardIsSelected,
    costGemImageSrc,
    heroAbilities,
    heroSymbol,
    theirId,
    playerName
  } = props;

  return (
    <div className={styles['opponent']} data-component="Opponent">
      <Hero
        avatarPlaceholderImageSrc={avatarPlaceholderImageSrc}
        cardIsSelected={cardIsSelected}
        cardsInDeck={cardsInDeckCount}
        cardsInHand={cardsInHandCount}
        costGemImageSrc={costGemImageSrc}
        heroAbilities={heroAbilities}
        heroSymbol={heroSymbol}
        yourId={theirId}
        parentComponent="Opponent"
        playerName={playerName}
      />
    </div>
  );
};

Opponent.propTypes = {
  avatarPlaceholderImageSrc: PropTypes.string.isRequired,
  cardsInDeckCount: PropTypes.number,
  cardsInHandCount: PropTypes.number,
  cardIsSelected: PropTypes.bool,
  costGemImageSrc: PropTypes.string.isRequired,
  heroAbilities: PropTypes.array,
  heroSymbol: PropTypes.string.isRequired,
  theirId: PropTypes.string.isRequired,
  playerName: PropTypes.string
};

Opponent.defaultProps = {
  cardsInDeckCount: 0,
  cardsInHandCount: 0,
  cardIsSelected: false,
  heroAbilities: [],
  playerName: 'Opponent'
};

export default Opponent;
