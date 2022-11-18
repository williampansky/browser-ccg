import { useState } from 'react';
import Image from 'next/image';

import styles from './card-flair-image.module.scss';
import PLACEHOLDER from '../../../../public/images/sets/PLACEHOLDER.jpg';

interface CardFlairImageProps {
  name: string;
  src: string;
}

export const CardFlairImage = ({ name, src }: CardFlairImageProps) => {
  const source = src || src === '' ? src : PLACEHOLDER;
  const [err, setErr] = useState<boolean>(false);

  return (
    <div className={styles['component']}>
      <Image
        alt={name}
        className={styles['image']}
        layout='fill'
        onError={() => setErr(true)}
        priority
        role='presentation'
        src={!err ? source : PLACEHOLDER}
      />
    </div>
  );
};
