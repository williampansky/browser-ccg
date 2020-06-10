import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Avatar, PlayerName, AppIcon } from '@ccg/components';
import { getHeroImage, getHeroName } from '@ccg/utils';

const Hero = ({ heroSymbol, avatarPlaceholderImageSrc }) => {
  return (
    <article className={styles['hero']} data-file="Hero">
      <Avatar
        heroImageSrc={getHeroImage(heroSymbol, 'AVATAR')}
        heroName={getHeroName(heroSymbol)}
        placeholderImageSrc={avatarPlaceholderImageSrc}
      />
      <header className={styles['player__info']}>
        <PlayerName name="pantsme" />
        <AppIcon fileName="HAND" />
      </header>
    </article>
  );
};

Hero.propTypes = {
  heroSymbol: PropTypes.string.isRequired,
  avatarPlaceholderImageSrc: PropTypes.string.isRequired
};

export default Hero;
