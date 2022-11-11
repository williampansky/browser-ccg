import styles from './card-subtype-badge.module.scss';
import PLACEHOLDER from '../../../../public/images/sets/PLACEHOLDER.jpg';

interface CardSubTypeBadgeProps {
  race?: string;
  type?: string;
  badgeImgSrc?: string;
  subtypeIconAlt?: string;
  subtypeImgSrc?: string;
}

export const CardSubTypeBadge = ({
  race,
  type,
  badgeImgSrc,
  subtypeIconAlt,
  subtypeImgSrc,
}: CardSubTypeBadgeProps) => {
  const src = `/images/card-assets/SUBTYPE_RACE_${race}.png`;
  return race !== 'NONE' && race !== undefined ? (
    <div className={styles['card__subtype__image__wrapper']}>
      <div className={styles['card__subtype__image__icon__wrapper']}>
        <img
          alt={`${race} Icon`}
          className={styles['card__subtype__image']}
          role='presentation'
          src={src}
        />
      </div>
      <img
        alt=''
        className={styles['card__subtype__image__badge']}
        role='presentation'
        src={badgeImgSrc}
      />
    </div>
  ) : null;
};
