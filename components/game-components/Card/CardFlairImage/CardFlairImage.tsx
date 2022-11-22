import { useState } from 'react';
import Image from 'next/image';

import styles from './card-flair-image.module.scss';
import PLACEHOLDER from '../../../../public/images/sets/PLACEHOLDER.jpg';

interface CardFlairImageProps {
  name: string;
  src: string;
  fpoArt?: boolean;
}

export const CardFlairImage = ({ name, src, fpoArt }: CardFlairImageProps) => {
  const source = src || src === '' ? src : PLACEHOLDER;
  const [err, setErr] = useState<boolean>(false);

  return (
    <div className={styles['component']}>
      {fpoArt && <div className={styles['fpo']}>FPO</div>}
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
