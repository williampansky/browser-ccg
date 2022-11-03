import { ReactElement } from 'react';
import styles from './minion-image.module.scss';

export interface ReactMinionImageProps {
  imageSrc?: string;
  name?: string;
  placeholderSrc?: string;
}

export const MinionImage = ({
  imageSrc,
  name,
  placeholderSrc,
}: ReactMinionImageProps): ReactElement => {
  return (
    <div className={styles['image__wrapper']} data-file='Minion/image'>
      <img
        alt={name}
        className={styles['image']}
        role='presentation'
        src={imageSrc}
      />
    </div>
  );
};
