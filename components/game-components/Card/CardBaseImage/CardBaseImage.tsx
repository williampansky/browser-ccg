import { ReactElement } from 'react';
import styles from './card-base-image.module.scss'

interface CardBaseImageProps {
  imageAlt?: string;
  imageSrc?: any;
  placeholderBaseSrc?: string;
}

export const CardBaseImage = ({
  imageAlt,
  imageSrc,
  placeholderBaseSrc,
}: CardBaseImageProps): ReactElement => {
  return (
    <img
      alt={imageAlt}
      className={styles['base__image']}
      role="presentation"
      src={imageSrc}
    />
  );
};
