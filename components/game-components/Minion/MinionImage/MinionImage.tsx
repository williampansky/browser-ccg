import { useState } from 'react';
import Image from 'next/image';

import styles from './minion-image.module.scss';
import PLACEHOLDER from '../../../../public/images/sets/PLACEHOLDER.jpg';

export interface ReactMinionImageProps {
  src?: string;
  name?: string;
  id?: string;
  set?: string;
  rarity: string;
  placeholderSrc?: string;
  fpoArt?: boolean;
  isHidden?: boolean;
  isDestroyed?: boolean;
}

export const MinionImage = ({
  src,
  name,
  id,
  set,
  rarity,
  placeholderSrc,
  fpoArt,
  isHidden = false,
  isDestroyed = false,
}: ReactMinionImageProps) => {
  const source = src || src === '' ? src?.replace('CARD', 'MINION') : PLACEHOLDER;
  const [err, setErr] = useState<boolean>(false);

  return (
    <div
      className={[
        styles['wrapper'],
        styles[rarity],
        isDestroyed ? styles['is-destroyed'] : '',
      ].join(' ')}
      data-component='MinionImage'
    >
      {fpoArt && <div className={styles['fpo']}>FPO</div>}

      {isHidden && (
        <div
          className='hidden__clouds'
          style={{ backgroundImage: `url('/images/mechanics/HIDDEN.png')` }}
        />
      )}

      <Image
        alt={name}
        layout='fill'
        onError={() => setErr(true)}
        priority
        role='presentation'
        src={!err ? source : PLACEHOLDER}
      />
    </div>
  );
};
