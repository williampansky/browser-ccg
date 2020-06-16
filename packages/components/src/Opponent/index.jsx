import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Hero } from '@ccg/components';

const Opponent = props => {
  const {
    avatarPlaceholderImageSrc,
    cardIsSelected,
    cardsInDeckCount,
    cardsInHandCount,
    costGemImageSrc,
    actionPointsCurrent,
    actionPointsTotal,
    heroAbilities,
    heroSymbol,
    playerHealthCurrent,
    playerHealthTotal,
    playerName,
    theirID,
    selectedCardContext
  } = props;

  return (
    <div className={styles['opponent']} data-component="Opponent">
      <Hero
        avatarPlaceholderImageSrc={avatarPlaceholderImageSrc}
        cardIsSelected={cardIsSelected}
        cardsInDeck={cardsInDeckCount}
        cardsInHand={cardsInHandCount}
        costGemImageSrc={costGemImageSrc}
        actionPointsCurrent={actionPointsCurrent}
        actionPointsTotal={actionPointsTotal}
        heroAbilities={heroAbilities}
        heroSymbol={heroSymbol}
        parentComponent="Opponent"
        playerHealthCurrent={playerHealthCurrent}
        playerHealthTotal={playerHealthTotal}
        playerName={playerName}
        playerId={theirID}
        selectedCardContext={selectedCardContext}
      />
    </div>
  );
};

Opponent.propTypes = {
  avatarPlaceholderImageSrc: PropTypes.string.isRequired,
  cardIsSelected: PropTypes.bool,
  cardsInDeckCount: PropTypes.number,
  cardsInHandCount: PropTypes.number,
  costGemImageSrc: PropTypes.string.isRequired,
  actionPointsCurrent: PropTypes.number.isRequired,
  actionPointsTotal: PropTypes.number.isRequired,
  heroAbilities: PropTypes.array,
  heroSymbol: PropTypes.string.isRequired,
  playerHealthCurrent: PropTypes.number.isRequired,
  playerHealthTotal: PropTypes.number.isRequired,
  playerName: PropTypes.string,
  theirID: PropTypes.string.isRequired
};

Opponent.defaultProps = {
  cardsInDeckCount: 0,
  cardsInHandCount: 0,
  cardIsSelected: false,
  heroAbilities: [],
  playerName: 'Opponent'
};

export default Opponent;
