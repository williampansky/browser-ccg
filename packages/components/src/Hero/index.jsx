import React, { Fragment, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import {
  Avatar,
  PlayerName,
  PlayerStatIcon,
  ReactBurgerMenu,
  PlayerHealthOrb,
  PlayerDeck,
  HeroAbilityFAB,
  PlayerStatEnergy
} from '@ccg/components';
import { getHeroImage, getHeroName } from '@ccg/utils';

const Hero = props => {
  const {
    abilitiesImageBase,
    abilitiesImageClose,
    avatarPlaceholderImageSrc,
    cardIsSelected,
    cardsInDeck,
    cardsInHand,
    costGemImageSrc,
    energyCurrent,
    energyTotal,
    heroAbilities,
    heroSymbol,
    playerArmorPoints,
    playerDeck,
    playerHealthCurrent,
    playerHealthTotal,
    yourId,
    parentComponent,
    playerName
  } = props;

  const [deckMenuOpen, setDeckMenuOpen] = useState(false);

  const handleDeckIconClick = useCallback(
    event => {
      event.preventDefault();
      !deckMenuOpen ? setDeckMenuOpen(true) : setDeckMenuOpen(false);
    },
    [deckMenuOpen, setDeckMenuOpen]
  );

  // This keeps the deckMenuOpen state in sync
  const handleDeckMenuStateChange = state => {
    const { isOpen } = state;
    return setDeckMenuOpen(isOpen);
  };

  return (
    <Fragment>
      <article
        className={[
          styles['hero'],
          cardIsSelected ? styles['card--is-selected'] : ''
        ].join(' ')}
        data-component="Hero"
      >
        <Avatar
          heroImageSrc={getHeroImage(heroSymbol, 'AVATAR')}
          heroName={getHeroName(heroSymbol)}
          placeholderImageSrc={avatarPlaceholderImageSrc}
        />

        <header className={styles['player__info']}>
          <div className={styles['player__stats']}>
            <PlayerStatIcon
              iconColor="#ccc"
              icon="HAND"
              statColor="white"
              statLabel="Cards in Hand"
              statValue={cardsInHand}
            />
            <PlayerStatIcon
              iconColor="#ccc"
              icon="DECK"
              onClick={e => handleDeckIconClick(e)}
              statColor="white"
              statLabel="Cards in Deck"
              statValue={cardsInDeck}
            />
            <PlayerStatEnergy
              iconColor="#ccc"
              statColor="white"
              statLabel="Cards in Deck"
              statValue={energyCurrent}
              totalEnergy={energyTotal}
            />
          </div>
          <PlayerName id={yourId} name={playerName} />
        </header>

        {parentComponent === 'Player' ? (
          <div className={styles['player__fab']}>
            <HeroAbilityFAB
              abilitiesImageBase={abilitiesImageBase}
              abilitiesImageClose={abilitiesImageClose}
              costImageSrc={costGemImageSrc}
              heroAbilities={heroAbilities}
              heroSymbol={heroSymbol}
            />
          </div>
        ) : null}

        <footer className={styles['player__health']}>
          <PlayerHealthOrb
            armorPoints={playerArmorPoints}
            currentHealth={playerHealthCurrent}
            totalHealth={playerHealthTotal}
          />
        </footer>
      </article>

      {parentComponent === 'Player' ? (
        <ReactBurgerMenu
          isOpen={deckMenuOpen}
          onStateChange={state => handleDeckMenuStateChange(state)}
          side="right"
        >
          <PlayerDeck costImageSrc={costGemImageSrc} playerDeck={playerDeck} />
        </ReactBurgerMenu>
      ) : null}
    </Fragment>
  );
};

Hero.propTypes = {
  abilitiesImageBase: PropTypes.string,
  abilitiesImageClose: PropTypes.string,
  avatarPlaceholderImageSrc: PropTypes.string.isRequired,
  cardIsSelected: PropTypes.bool,
  cardsInDeck: PropTypes.number,
  cardsInHand: PropTypes.number,
  costGemImageSrc: PropTypes.string,
  energyCurrent: PropTypes.number,
  energyTotal: PropTypes.number,
  heroAbilities: PropTypes.array,
  heroSymbol: PropTypes.string.isRequired,
  playerArmorPoints: PropTypes.number,
  playerDeck: PropTypes.array,
  playerHealthCurrent: PropTypes.number,
  playerHealthTotal: PropTypes.number,
  yourId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  playerName: PropTypes.string
};

Hero.defaultProps = {
  cardIsSelected: false,
  cardsInDeck: 0,
  cardsInHand: 0,
  energyCurrent: 0,
  energyTotal: 0,
  heroAbilities: [],
  playerDeck: [],
  playerArmorPoints: 0,
  playerHealthCurrent: 30,
  playerHealthTotal: 30
};

export default Hero;
