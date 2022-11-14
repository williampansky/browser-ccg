import { ReactElement } from 'react';
import styles from './card-rarity-gem.module.scss';

interface CardRarityGemProps {
  rarity?: string;
  gemImgAlt?: string;
  gemImgSrc?: string;
}

export const CardRarityGem = ({
  rarity,
  gemImgAlt,
  gemImgSrc,
}: CardRarityGemProps): ReactElement | null => {
  return rarity ? (
    <img
      alt={`${gemImgAlt} Gem`}
      className={styles[`card__rarity__gem`]}
      data-rarity={rarity}
      role='presentation'
      src={gemImgSrc}
    />
  ) : null;
};
