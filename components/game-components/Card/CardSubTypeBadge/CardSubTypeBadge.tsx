import { ReactElement } from 'react';
import styles from './card-subtype-badge.module.scss';

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
}: CardSubTypeBadgeProps): ReactElement | null => {
  return race && type ? (
    <div className={styles['card__subtype__image__wrapper']}>
      <div className={styles['card__subtype__image__icon__wrapper']}>
        <img
          alt={`${subtypeIconAlt} Icon`}
          className={styles['card__subtype__image']}
          role='presentation'
          src={subtypeImgSrc}
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
