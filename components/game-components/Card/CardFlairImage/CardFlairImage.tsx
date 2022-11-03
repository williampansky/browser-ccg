import { ReactElement } from 'react';
import styles from './card-flair-image.module.scss';

interface CardFlairImageProps {
  imageSrc?: string;
  name: string;
}

export const CardFlairImage = ({
  imageSrc,
  name,
}: CardFlairImageProps): ReactElement => {
  return (
    <div className={styles['card__flair__image__wrapper']}>
      <img
        alt={name}
        className={styles['card__flair__image']}
        role='presentation'
        src={imageSrc}
      />
    </div>
  );
};
