import { ReactElement } from 'react';
import Image from 'next/image'
import styles from './card-flair-image.module.scss';
import PLACEHOLDER from '../../../../public/images/sets/PLACEHOLDER.jpg';

interface CardFlairImageProps {
  id: string;
  set?: string;
  name: string;
}

export const CardFlairImage = ({
  id,
  set,
  name,
}: CardFlairImageProps): ReactElement => {
  const src = id ? `/images/sets/${set}/${id}-CARD.jpg` : PLACEHOLDER;
  return (
    <div className={styles['component']}>
      <Image
        alt={name}
        className={styles['image']}
        role='presentation'
        priority
        layout='fill'
        src={src}
      />
    </div>
  );
};
