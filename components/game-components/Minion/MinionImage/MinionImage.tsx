import Image from 'next/image';
import styles from './minion-image.module.scss';
import PLACEHOLDER from '../../../../public/images/sets/PLACEHOLDER.jpg';

export interface ReactMinionImageProps {
  imageSrc?: string;
  name?: string;
  id?: string;
  set?: string;
  rarity?: string;
  placeholderSrc?: string;
}

export const MinionImage = ({
  imageSrc,
  name,
  id,
  set,
  rarity,
  placeholderSrc,
}: ReactMinionImageProps) => {
  const src = id ? `/images/sets/${set}/${id}-MINION.jpg` : PLACEHOLDER;
  const rare = rarity ? rarity : 'NONE';

  return (
    <div
      className={[styles['wrapper'], styles[rare]].join(' ')}
      data-component='MinionImage'
    >
      <Image
        alt={name}
        className={styles['component']}
        layout='fill'
        priority
        role='presentation'
        src={src}
      />
    </div>
  );
};
