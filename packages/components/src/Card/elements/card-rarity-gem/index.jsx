import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardRarityGem = ({ rarity, gemImgSrc, rarityEnums }) => {
  return rarity !== rarityEnums['NONE'] || rarity !== rarityEnums['FREE'] ? (
    <img
      alt=""
      className={styles[`card__rarity__gem`]}
      data-rarity={rarity}
      src={gemImgSrc}
    />
  ) : null;
};

CardRarityGem.propTypes = {
  rarity: PropTypes.string,
  gemImgSrc: PropTypes.string,
  rarityEnums: PropTypes.object
};

export default CardRarityGem;
