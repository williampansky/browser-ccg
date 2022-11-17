import Image from 'next/image';
import styles from './minion-image.module.scss';
import PLACEHOLDER from '../../../../public/images/sets/PLACEHOLDER.jpg';
import { getImageFlairSrc } from '../../../../utils';

export interface ReactMinionImageProps {
  src?: string;
  name?: string;
  id?: string;
  set?: string;
  rarity: string;
  placeholderSrc?: string;
}

export const MinionImage = ({
  src,
  name,
  id,
  set,
  rarity,
  placeholderSrc,
}: ReactMinionImageProps) => {
  const source = src || src === '' ? src?.replace('CARD', 'MINION') : PLACEHOLDER;
  return (
    <div
      className={[styles['wrapper'], styles[rarity]].join(' ')}
      data-component='MinionImage'
    >
      <Image
        alt={name}
        className={styles['component']}
        layout='fill'
        priority
        role='presentation'
        src={source}
      />
    </div>
  );
};
