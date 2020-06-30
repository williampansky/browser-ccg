import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Hero, OpponentInteractionLayer } from '@ccg/components';

const Opponent = props => {
  const {
    G,
    G: {
      playerCanBeAttackedByMinion,
      playercanBeAttackedByOnPlay,
      playerCanBeAttackedByPlayer,
      playerCanBeAttackedBySpell
    },
    ctx,
    moves,
    actionPointsCurrent,
    actionPointsTotal,
    avatarPlaceholderImageSrc,
    cardIsSelected,
    cardsInDeckCount,
    cardsInHandCount,
    costGemImageSrc,
    heroAbilities,
    heroSymbol,
    parentComponent,
    playerHealthCurrent,
    playerHealthTotal,
    playerName,
    selectedCardContext,
    theirID
  } = props;

  return (
    <div className={styles['opponent']} data-component="Opponent">
      <OpponentInteractionLayer
        G={G}
        ctx={ctx}
        moves={moves}
        canBeAttackedByMinion={playerCanBeAttackedByMinion[theirID]}
        canBeAttackedByOnPlay={playercanBeAttackedByOnPlay[theirID]}
        canBeAttackedByPlayer={playerCanBeAttackedByPlayer[theirID]}
        canBeAttackedBySpell={playerCanBeAttackedBySpell[theirID]}
      />

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
        parentComponent={parentComponent}
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
  actionPointsCurrent: PropTypes.number.isRequired,
  actionPointsTotal: PropTypes.number.isRequired,
  avatarPlaceholderImageSrc: PropTypes.string.isRequired,
  cardIsSelected: PropTypes.bool,
  cardsInDeckCount: PropTypes.number,
  cardsInHandCount: PropTypes.number,
  costGemImageSrc: PropTypes.string.isRequired,
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
