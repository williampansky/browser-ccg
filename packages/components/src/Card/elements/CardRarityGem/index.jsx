import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardRarityGem = ({ rarity, gemImgAlt, gemImgSrc }) => (
  <img
    alt={`${gemImgAlt} Gem`}
    className={styles[`card__rarity__gem`]}
    data-rarity={rarity}
    role="presentation"
    src={gemImgSrc}
  />
);

CardRarityGem.propTypes = {
  rarity: PropTypes.string.isRequired,
  gemImgAlt: PropTypes.string.isRequired,
  gemImgSrc: PropTypes.string.isRequired
};

export default CardRarityGem;
