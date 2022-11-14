import Image from 'next/image';
import styles from './card-base-image.module.scss';

interface CardBaseImageProps {
  type?: string;
  rarity?: string;
  placeholderBaseSrc?: string;
}

export const CardBaseImage = ({
  type,
  rarity,
  placeholderBaseSrc,
}: CardBaseImageProps) => {
  const src = rarity
    ? `/images/cards/fronts/${rarity}.png`
    : '/images/cards/fronts/NONE.png';

  return (
    <Image
      alt={rarity}
      className={styles['component']}
      layout='fill'
      priority
      role='presentation'
      src={src}
    />
  );
};
