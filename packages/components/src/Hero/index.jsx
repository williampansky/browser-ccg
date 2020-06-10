import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import {
  Avatar,
  PlayerName,
  PlayerStatIcon,
  ReactBurgerMenu
} from '@ccg/components';
import { getHeroImage, getHeroName } from '@ccg/utils';

const Hero = ({
  heroSymbol,
  avatarPlaceholderImageSrc,
  cardsInDeck = 0,
  cardsInHand = 0,
  playerId,
  playerName
}) => {
  const [deckMenuOpen, setDeckMenuOpen] = useState(false);

  const handleDeckIconClick = useCallback(
    event => {
      event.preventDefault();
      !deckMenuOpen ? setDeckMenuOpen(true) : setDeckMenuOpen(false);
    },
    [deckMenuOpen, setDeckMenuOpen]
  );

  // This keeps your state in sync
  function handleStateChange(state) {
    const { isOpen } = state;
    return setDeckMenuOpen(isOpen);
  }

  useEffect(() => {}, []);

  return (
    <article className={styles['hero']} data-file="Hero">
      <Avatar
        heroImageSrc={getHeroImage(heroSymbol, 'AVATAR')}
        heroName={getHeroName(heroSymbol)}
        placeholderImageSrc={avatarPlaceholderImageSrc}
      />
      <header className={styles['player__info']}>
        <PlayerName id={playerId} name={playerName} />
        <div className={styles['player__stats']}>
          <PlayerStatIcon
            iconColor="white"
            icon="HAND"
            statColor="white"
            statLabel="Cards in Hand"
            statValue={cardsInHand}
          />
          <PlayerStatIcon
            iconColor="white"
            icon="DECK"
            onClick={e => handleDeckIconClick(e)}
            statColor="white"
            statLabel="Cards in Deck"
            statValue={cardsInDeck}
          />
        </div>
      </header>
      <ReactBurgerMenu
        isOpen={deckMenuOpen}
        onStateChange={state => handleStateChange(state)}
      />
    </article>
  );
};

Hero.propTypes = {
  avatarPlaceholderImageSrc: PropTypes.string.isRequired,
  cardsInDeck: PropTypes.number,
  cardsInHand: PropTypes.number,
  heroSymbol: PropTypes.string.isRequired,
  playerId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  playerName: PropTypes.string
};

export default Hero;
