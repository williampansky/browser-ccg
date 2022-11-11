import styles from './card-type-badge.module.scss';

interface CardTypeBadgeProps {
  race?: string;
  type?: string;
  badgeImgSrc?: string;
  typeIconAlt?: string;
  typeImgSrc?: string;
}

export const CardTypeBadge = ({
  race,
  type,
  badgeImgSrc,
  typeIconAlt,
  typeImgSrc,
}: CardTypeBadgeProps) => {
  const src = `/images/card-assets/TYPE_${type}.png`;
  return race && type ? (
    <div className={styles['card__type__image__wrapper']}>
      <div className={styles['card__type__image__icon__wrapper']}>
        <img
          alt={`${typeIconAlt} Icon`}
          className={styles['card__type__image']}
          role='presentation'
          src={src}
        />
      </div>
      <img
        alt=''
        className={styles['card__type__image__badge']}
        role='presentation'
        src={badgeImgSrc}
      />
    </div>
  ) : null;
};
